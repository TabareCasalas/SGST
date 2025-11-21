#!/bin/bash

# Script de deployment automatizado para SGST
# Este script despliega toda la aplicación en un servidor de Google Cloud
# Uso: ./deploy.sh [usuario_ssh] [ip_servidor]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
SSH_USER="${1:-$USER}"
SERVER_IP="${2:-35.199.81.198}"
GIT_REPO="https://github.com/TabareCasalas/SGST.git"
GIT_BRANCH="taba-branch"
APP_DIR="/opt/sgst"
REPO_URL="https://github.com/TabareCasalas/SGST"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Automatizado SGST${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Servidor: ${SSH_USER}@${SERVER_IP}"
echo -e "Repositorio: ${REPO_URL}"
echo -e "Rama: ${GIT_BRANCH}"
echo ""

# Verificar conexión SSH
echo -e "${YELLOW}[1/8] Verificando conexión SSH...${NC}"
if ! ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SSH_USER}@${SERVER_IP} "echo 'Conexión exitosa'" 2>/dev/null; then
    echo -e "${RED}Error: No se pudo conectar al servidor${NC}"
    echo "Asegúrate de que:"
    echo "  1. El servidor esté accesible"
    echo "  2. Tengas acceso SSH configurado"
    echo "  3. La IP sea correcta: ${SERVER_IP}"
    exit 1
fi
echo -e "${GREEN}✓ Conexión SSH exitosa${NC}"

# Ejecutar deployment en el servidor
echo -e "${YELLOW}[2/8] Ejecutando deployment en el servidor...${NC}"
ssh ${SSH_USER}@${SERVER_IP} <<'ENDSSH'
set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR="/opt/sgst"
GIT_REPO="https://github.com/TabareCasalas/SGST.git"
GIT_BRANCH="taba-branch"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Instalación en el servidor${NC}"
echo -e "${GREEN}========================================${NC}"

# Actualizar sistema
echo -e "${YELLOW}[1] Actualizando sistema...${NC}"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# Instalar dependencias básicas
echo -e "${YELLOW}[2] Instalando dependencias básicas...${NC}"
sudo apt-get install -y -qq \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    lsb-release \
    apt-transport-https \
    software-properties-common

# Instalar Docker si no está instalado
echo -e "${YELLOW}[3] Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    # Agregar repositorio oficial de Docker
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update -qq
    sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Agregar usuario actual al grupo docker
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker instalado${NC}"
else
    echo -e "${GREEN}✓ Docker ya está instalado${NC}"
fi

# Instalar Docker Compose (standalone) si no está disponible como plugin
if ! docker compose version &> /dev/null; then
    echo "Instalando Docker Compose..."
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose instalado${NC}"
else
    echo -e "${GREEN}✓ Docker Compose ya está disponible${NC}"
fi

# Crear directorio de la aplicación
echo -e "${YELLOW}[4] Configurando directorio de la aplicación...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clonar o actualizar repositorio
echo -e "${YELLOW}[5] Clonando/Actualizando repositorio...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    echo "Actualizando repositorio existente..."
    cd $APP_DIR
    git fetch origin
    git checkout $GIT_BRANCH
    git pull origin $GIT_BRANCH
else
    echo "Clonando repositorio..."
    cd /opt
    sudo rm -rf $APP_DIR
    git clone -b $GIT_BRANCH $GIT_REPO $APP_DIR
    cd $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
fi
echo -e "${GREEN}✓ Repositorio actualizado${NC}"

# Crear archivo .env si no existe
echo -e "${YELLOW}[6] Configurando variables de entorno...${NC}"
if [ ! -f "$APP_DIR/.env" ]; then
    echo "Creando archivo .env desde env.example..."
    cp $APP_DIR/env.example $APP_DIR/.env
    
    # Actualizar URLs con la IP del servidor
    SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
    sed -i "s|FRONTEND_URL=http://localhost|FRONTEND_URL=http://${SERVER_IP}|g" $APP_DIR/.env
    sed -i "s|BACKEND_URL=http://localhost:3001|BACKEND_URL=http://${SERVER_IP}:3001|g" $APP_DIR/.env
    sed -i "s|CAMUNDA_URL=http://localhost:8081|CAMUNDA_URL=http://${SERVER_IP}:8081|g" $APP_DIR/.env
    sed -i "s|ORCHESTRATOR_URL=http://localhost:3002|ORCHESTRATOR_URL=http://${SERVER_IP}:3002|g" $APP_DIR/.env
    
    # Generar secrets aleatorios para producción
    JWT_SECRET=$(openssl rand -base64 32)
    REFRESH_SECRET=$(openssl rand -base64 32)
    ORCHESTRATOR_TOKEN=$(openssl rand -base64 32)
    
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" $APP_DIR/.env
    sed -i "s|REFRESH_SECRET=.*|REFRESH_SECRET=${REFRESH_SECRET}|g" $APP_DIR/.env
    sed -i "s|ORCHESTRATOR_TOKEN=.*|ORCHESTRATOR_TOKEN=${ORCHESTRATOR_TOKEN}|g" $APP_DIR/.env
    
    echo -e "${GREEN}✓ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠ IMPORTANTE: Revisa y ajusta el archivo .env si es necesario${NC}"
else
    echo -e "${GREEN}✓ Archivo .env ya existe${NC}"
fi

# Configurar firewall
echo -e "${YELLOW}[7] Configurando firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw --force enable || true
    sudo ufw allow 22/tcp || true    # SSH
    sudo ufw allow 80/tcp || true    # Frontend
    sudo ufw allow 3001/tcp || true  # Backend
    sudo ufw allow 8080/tcp || true  # PgAdmin
    sudo ufw allow 8081/tcp || true  # Operate
    sudo ufw allow 8082/tcp || true  # Tasklist
    sudo ufw allow 8083/tcp || true  # Identity
    echo -e "${GREEN}✓ Firewall configurado${NC}"
else
    echo -e "${YELLOW}⚠ UFW no está instalado, configurando firewall manualmente...${NC}"
fi

# Construir y levantar contenedores
echo -e "${YELLOW}[8] Construyendo y levantando contenedores...${NC}"
cd $APP_DIR

# Intentar primero sin sudo, luego con sudo si es necesario
DOCKER_CMD="docker"
if ! docker ps &> /dev/null 2>&1; then
    echo "Docker requiere sudo, usando sudo..."
    DOCKER_CMD="sudo docker"
    # Agregar usuario al grupo docker para futuras ejecuciones
    sudo usermod -aG docker $USER 2>/dev/null || true
fi

# Detener contenedores existentes
echo "Deteniendo contenedores existentes..."
$DOCKER_CMD compose down 2>/dev/null || true

# Descargar imágenes actualizadas
echo "Descargando imágenes..."
$DOCKER_CMD compose pull

# Construir imágenes
echo "Construyendo imágenes (esto puede tardar varios minutos)..."
$DOCKER_CMD compose build --no-cache

# Levantar servicios
echo "Levantando servicios..."
$DOCKER_CMD compose up -d

# Esperar a que los servicios estén listos
echo -e "${YELLOW}[9] Esperando a que los servicios estén listos...${NC}"
sleep 10

# Verificar estado de los contenedores
echo -e "${YELLOW}[10] Verificando estado de los contenedores...${NC}"
$DOCKER_CMD ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completado${NC}"
echo -e "${GREEN}========================================${NC}"
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
echo -e "Frontend: ${GREEN}http://${SERVER_IP}${NC}"
echo -e "Backend API: ${GREEN}http://${SERVER_IP}:3001${NC}"
echo -e "Camunda Operate: ${GREEN}http://${SERVER_IP}:8081${NC}"
echo -e "Camunda Tasklist: ${GREEN}http://${SERVER_IP}:8082${NC}"
echo -e "Camunda Identity: ${GREEN}http://${SERVER_IP}:8083${NC}"
echo -e "PgAdmin: ${GREEN}http://${SERVER_IP}:8080${NC}"
echo ""
echo -e "Comandos útiles:"
echo -e "  Ver logs: ${YELLOW}docker compose logs -f${NC}"
echo -e "  Ver estado: ${YELLOW}docker compose ps${NC}"
echo -e "  Detener: ${YELLOW}docker compose down${NC}"
echo -e "  Reiniciar: ${YELLOW}docker compose restart${NC}"
echo -e "  Ver logs de un servicio: ${YELLOW}docker compose logs -f [servicio]${NC}"
echo -e "${GREEN}========================================${NC}"

ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completado exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "La aplicación está disponible en:"
echo -e "  Frontend: ${GREEN}http://${SERVER_IP}${NC}"
echo -e "  Backend: ${GREEN}http://${SERVER_IP}:3001${NC}"
echo ""
echo -e "Para ver los logs en tiempo real, ejecuta:"
echo -e "  ${YELLOW}ssh ${SSH_USER}@${SERVER_IP} 'cd /opt/sgst && docker compose logs -f'${NC}"
echo ""

