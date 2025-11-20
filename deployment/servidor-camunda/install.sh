#!/bin/bash

# Script de instalación de Camunda para SGST
# Ejecutar como: sudo bash install.sh

set -e

echo "========================================="
echo "Instalación de Camunda para SGST"
echo "========================================="

# Variables de configuración
APP_USER="sgst"
APP_DIR="/opt/sgst-camunda"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-camunda_db}"
DB_USER="${DB_USER:-sgst_user}"
DB_PASSWORD="${DB_PASSWORD:-change_me}"

# Actualizar sistema
echo "Actualizando sistema..."
apt update && apt upgrade -y

# Instalar dependencias
echo "Instalando dependencias..."
apt install -y curl wget git ca-certificates gnupg lsb-release

# Instalar Docker
echo "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    # Agregar repositorio de Docker
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# Instalar Docker Compose (standalone)
echo "Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Crear usuario para la aplicación
echo "Creando usuario ${APP_USER}..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -r -s /bin/false -d $APP_DIR $APP_USER
fi

# Agregar usuario al grupo docker
usermod -aG docker $APP_USER

# Crear directorio de la aplicación
mkdir -p $APP_DIR
mkdir -p $APP_DIR/data/zeebe
mkdir -p $APP_DIR/data/elasticsearch
mkdir -p $APP_DIR/diagrams
chown -R $APP_USER:$APP_USER $APP_DIR

# Copiar docker-compose.yml
echo "Configurando Docker Compose..."
# NOTA: El archivo docker-compose.yml debe estar en el directorio actual

# Crear archivo .env
echo "Creando archivo .env..."
cat > $APP_DIR/.env <<EOF
# Base de datos
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Puertos
ZEEBE_PORT=26500
ZEEBE_GATEWAY_PORT=26501
OPERATE_PORT=8081
TASKLIST_PORT=8082
IDENTITY_PORT=8083
ELASTICSEARCH_PORT=9200
EOF

chown $APP_USER:$APP_USER $APP_DIR/.env
chmod 600 $APP_DIR/.env

# Crear docker-compose.yml
cat > $APP_DIR/docker-compose.yml <<'COMPOSEEOF'
version: '3.8'

services:
  # Elasticsearch (requerido por Camunda 8 Operate)
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: sgst_elasticsearch
    restart: unless-stopped
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "${ELASTICSEARCH_PORT:-9200}:9200"
    volumes:
      - ./data/elasticsearch:/usr/share/elasticsearch/data
    networks:
      - sgst_network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Zeebe - Motor de procesos de Camunda 8
  zeebe:
    image: camunda/zeebe:8.5.0
    container_name: sgst_zeebe
    restart: unless-stopped
    environment:
      - ZEEBE_BROKER_DATA_DISKUSAGECOMMANDWATERMARK=0.998
      - ZEEBE_BROKER_DATA_DISKUSAGEREPLICATIONWATERMARK=0.999
      - ZEEBE_BROKER_CLUSTER_PARTITIONSCOUNT=2
      - ZEEBE_BROKER_CLUSTER_REPLICATIONFACTOR=1
      - ZEEBE_BROKER_CLUSTER_CLUSTERSIZE=1
      - ZEEBE_BROKER_CLUSTER_NODEID=0
      - ZEEBE_BROKER_NETWORK_HOST=0.0.0.0
      - ZEEBE_BROKER_NETWORK_ADVERTISEDHOST=zeebe
      - ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_CLASSNAME=io.camunda.zeebe.exporter.ElasticsearchExporter
      - ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_URL=http://elasticsearch:9200
      - ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_BULK_SIZE=1
      - ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_BULK_DELAY=5
    ports:
      - "${ZEEBE_PORT:-26500}:26500"
      - "${ZEEBE_GATEWAY_PORT:-26501}:26501"
    volumes:
      - ./data/zeebe:/usr/local/zeebe/data
      - ./diagrams:/usr/local/zeebe/configuration/resources
    depends_on:
      elasticsearch:
        condition: service_healthy
    networks:
      - sgst_network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9600/actuator/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Operate - Monitoreo y gestión de procesos
  operate:
    image: camunda/operate:8.5.0
    container_name: sgst_operate
    restart: unless-stopped
    environment:
      - CAMUNDA_OPERATE_ZEEBE_GATEWAYADDRESS=zeebe:26500
      - CAMUNDA_OPERATE_ELASTICSEARCH_URL=http://elasticsearch:9200
      - CAMUNDA_OPERATE_ZEEBEELASTICSEARCH_URL=http://elasticsearch:9200
      - CAMUNDA_OPERATE_MULTITENANCY_ENABLED=false
    ports:
      - "${OPERATE_PORT:-8081}:8080"
    depends_on:
      - zeebe
      - elasticsearch
    networks:
      - sgst_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Tasklist - Gestión de tareas de usuario
  tasklist:
    image: camunda/tasklist:8.5.0
    container_name: sgst_tasklist
    restart: unless-stopped
    environment:
      - CAMUNDA_TASKLIST_ZEEBE_GATEWAYADDRESS=zeebe:26500
      - CAMUNDA_TASKLIST_ELASTICSEARCH_URL=http://elasticsearch:9200
      - CAMUNDA_TASKLIST_ZEEBEELASTICSEARCH_URL=http://elasticsearch:9200
      - CAMUNDA_TASKLIST_GRAPHQL_URL=http://operate:8080
      - CAMUNDA_TASKLIST_MULTITENANCY_ENABLED=false
    ports:
      - "${TASKLIST_PORT:-8082}:8080"
    depends_on:
      - zeebe
      - operate
      - elasticsearch
    networks:
      - sgst_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Identity - Autenticación y autorización
  identity:
    image: camunda/identity:8.5.0
    container_name: sgst_identity
    restart: unless-stopped
    environment:
      - CAMUNDA_IDENTITY_DATABASE_URL=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
      - CAMUNDA_IDENTITY_DATABASE_USERNAME=${DB_USER}
      - CAMUNDA_IDENTITY_DATABASE_PASSWORD=${DB_PASSWORD}
      - CAMUNDA_IDENTITY_DATABASE_DRIVER=org.postgresql.Driver
      - CAMUNDA_IDENTITY_AUTH_JWT_ISSUER=http://identity:8080
      - CAMUNDA_IDENTITY_AUTH_JWT_AUDIENCE=operate, tasklist, optimize
    ports:
      - "${IDENTITY_PORT:-8083}:8080"
    depends_on:
      - elasticsearch
    networks:
      - sgst_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Orchestrator - Comunica Camunda 8 (Zeebe) con el Backend
  orchestrator:
    image: node:18-alpine
    container_name: sgst_orchestrator
    restart: unless-stopped
    working_dir: /app
    command: sh -c "npm install && npm start"
    environment:
      ORCHESTRATOR_PORT: 3002
      ZEEBE_ADDRESS: zeebe:26500
      BACKEND_URL: ${BACKEND_URL:-http://localhost:3001}
      NODE_ENV: production
      ORCHESTRATOR_TOKEN: ${ORCHESTRATOR_TOKEN:-change_me}
    ports:
      - "3002:3002"
    volumes:
      - ./orchestrator:/app
    depends_on:
      - zeebe
    networks:
      - sgst_network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  sgst_network:
    driver: bridge
COMPOSEEOF

chown $APP_USER:$APP_USER $APP_DIR/docker-compose.yml

# Copiar diagramas BPMN
echo "Copiando diagramas BPMN..."
# NOTA: Los diagramas deben copiarse manualmente a $APP_DIR/diagrams/

# Copiar código del orchestrator
echo "Copiando código del orchestrator..."
# NOTA: El código del orchestrator debe copiarse manualmente a $APP_DIR/orchestrator/

# Iniciar servicios
echo "Iniciando servicios de Camunda..."
cd $APP_DIR
sudo -u $APP_USER docker-compose up -d

# Esperar a que los servicios estén listos
echo "Esperando a que los servicios estén listos..."
sleep 30

# Verificar servicios
echo "Verificando servicios..."
sudo -u $APP_USER docker-compose ps

# Configurar firewall
echo "Configurando firewall..."
ufw allow 26500/tcp
ufw allow 26501/tcp
ufw allow 8081/tcp
ufw allow 8082/tcp
ufw allow 8083/tcp
ufw allow 3002/tcp

echo ""
echo "========================================="
echo "Camunda instalado correctamente"
echo "========================================="
echo "Directorio: $APP_DIR"
echo "Usuario: $APP_USER"
echo ""
echo "Servicios disponibles:"
echo "  - Zeebe: puerto 26500"
echo "  - Operate: http://<IP>:8081"
echo "  - Tasklist: http://<IP>:8082"
echo "  - Identity: http://<IP>:8083"
echo "  - Orchestrator: puerto 3002"
echo ""
echo "Comandos útiles:"
echo "  Ver logs: sudo -u $APP_USER docker-compose -f $APP_DIR/docker-compose.yml logs -f"
echo "  Reiniciar: sudo -u $APP_USER docker-compose -f $APP_DIR/docker-compose.yml restart"
echo "  Estado: sudo -u $APP_USER docker-compose -f $APP_DIR/docker-compose.yml ps"
echo "========================================="

