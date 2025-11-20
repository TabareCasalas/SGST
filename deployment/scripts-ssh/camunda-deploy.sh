#!/bin/bash
# Script de deployment para servidor de Camunda
# Ejecutar directamente desde SSH

set -e

echo "========================================="
echo "Deployment de Camunda SGST"
echo "========================================="

# Variables configurables (configurar antes de ejecutar)
GIT_REPO="https://github.com/TabareCasalas/SGST.git"
GIT_BRANCH="taba-branch"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-camunda_db}"
DB_USER="${DB_USER:-sgst_user}"
DB_PASSWORD="${DB_PASSWORD:-change_me}"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
ORCHESTRATOR_TOKEN="${ORCHESTRATOR_TOKEN:-change_me}"

# Valores por defecto si no están configurados (para deployment automático)
DB_HOST="${DB_HOST:-35.198.27.56}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-camunda_db}"
DB_USER="${DB_USER:-sgst_user}"
DB_PASSWORD="${DB_PASSWORD:-sgst_password}"
BACKEND_URL="${BACKEND_URL:-http://35.199.81.198:3001}"
ORCHESTRATOR_TOKEN="${ORCHESTRATOR_TOKEN:-aB3xK9mP2vQ7wR5tY8uI1oE4nM6cL0dF9gH2jK5sA8bC1eD4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4}"

# Actualizar sistema
echo "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
echo "Instalando dependencias..."
sudo apt install -y curl wget git ca-certificates gnupg lsb-release

# Instalar Docker
echo "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

# Instalar Docker Compose
echo "Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Clonar repositorio
echo "Clonando repositorio..."
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR
git clone -b $GIT_BRANCH $GIT_REPO sgst
cd sgst

# Crear usuario si no existe
APP_USER="sgst"
APP_DIR="/opt/sgst-camunda"
if ! id "$APP_USER" &>/dev/null; then
    sudo useradd -r -s /bin/false -d $APP_DIR $APP_USER
fi

# Agregar usuario al grupo docker
sudo usermod -aG docker $APP_USER

# Crear directorios
sudo mkdir -p $APP_DIR
sudo mkdir -p $APP_DIR/data/zeebe
sudo mkdir -p $APP_DIR/data/elasticsearch
sudo mkdir -p $APP_DIR/diagrams
sudo mkdir -p $APP_DIR/orchestrator
sudo chown -R $APP_USER:$APP_USER $APP_DIR

# Copiar diagramas BPMN
echo "Copiando diagramas BPMN..."
sudo cp -r camunda/diagrams/* $APP_DIR/diagrams/ 2>/dev/null || true

# Copiar código del orchestrator
echo "Copiando código del orchestrator..."
sudo cp -r orchestrator/* $APP_DIR/orchestrator/
sudo chown -R $APP_USER:$APP_USER $APP_DIR

# Crear archivo .env
echo "Creando archivo .env..."
sudo -u $APP_USER cat > $APP_DIR/.env <<EOF
# Base de datos
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# Backend
BACKEND_URL=${BACKEND_URL}
ORCHESTRATOR_TOKEN=${ORCHESTRATOR_TOKEN}

# Puertos
ZEEBE_PORT=26500
ZEEBE_GATEWAY_PORT=26501
OPERATE_PORT=8081
TASKLIST_PORT=8082
IDENTITY_PORT=8083
ELASTICSEARCH_PORT=9200
EOF
sudo chmod 600 $APP_DIR/.env

# Crear docker-compose.yml
echo "Creando docker-compose.yml..."
sudo -u $APP_USER cat > $APP_DIR/docker-compose.yml <<'COMPOSEEOF'
version: '3.8'

services:
  # Elasticsearch
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

  # Zeebe
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

  # Operate
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

  # Tasklist
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

  # Identity
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

  # Orchestrator
  orchestrator:
    image: node:18-alpine
    container_name: sgst_orchestrator
    restart: unless-stopped
    working_dir: /app
    command: sh -c "npm install && npm start"
    environment:
      ORCHESTRATOR_PORT: 3002
      ZEEBE_ADDRESS: zeebe:26500
      BACKEND_URL: ${BACKEND_URL}
      NODE_ENV: production
      ORCHESTRATOR_TOKEN: ${ORCHESTRATOR_TOKEN}
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
sudo ufw allow 26500/tcp || true
sudo ufw allow 26501/tcp || true
sudo ufw allow 8081/tcp || true
sudo ufw allow 8082/tcp || true
sudo ufw allow 8083/tcp || true
sudo ufw allow 3002/tcp || true

# Limpiar
cd /
rm -rf $TEMP_DIR

echo ""
echo "========================================="
echo "Deployment completado"
echo "========================================="
echo "Servicios disponibles:"
echo "  - Zeebe: puerto 26500"
echo "  - Operate: http://$(curl -s ifconfig.me):8081"
echo "  - Tasklist: http://$(curl -s ifconfig.me):8082"
echo "  - Identity: http://$(curl -s ifconfig.me):8083"
echo "  - Orchestrator: puerto 3002"
echo ""
echo "Ver logs: sudo -u sgst docker-compose -f $APP_DIR/docker-compose.yml logs -f"
echo "========================================="

