#!/bin/bash

# Script de deployment del Frontend SGST
# Ejecutar desde el directorio raíz del proyecto

set -e

echo "========================================="
echo "Deployment de Frontend SGST"
echo "========================================="

# Variables de configuración
SERVER_USER="${SERVER_USER:-sgst}"
SERVER_HOST="${SERVER_HOST:-localhost}"
SERVER_DIR="/opt/sgst-frontend"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"

# Verificar que estamos en el directorio correcto
if [ ! -d "frontend" ]; then
    echo "Error: Debes ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# Crear backup del código actual en el servidor
echo "Creando backup..."
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_DIR}/backups && \
    if [ -d ${SERVER_DIR}/src ]; then \
        tar -czf ${SERVER_DIR}/backups/frontend_\$(date +%Y%m%d_%H%M%S).tar.gz -C ${SERVER_DIR} .; \
    fi"

# Crear archivo temporal con el código
echo "Preparando archivos..."
TEMP_DIR=$(mktemp -d)
cp -r frontend/* $TEMP_DIR/
cd $TEMP_DIR

# Eliminar node_modules y dist si existen
rm -rf node_modules dist

# Crear archivo .env.production
cat > .env.production <<EOF
VITE_API_URL=${BACKEND_URL}
EOF

# Comprimir código
echo "Comprimiendo código..."
tar -czf frontend.tar.gz .

# Subir al servidor
echo "Subiendo código al servidor..."
scp frontend.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/

# Ejecutar deployment en el servidor
echo "Ejecutando deployment en el servidor..."
ssh ${SERVER_USER}@${SERVER_HOST} <<EOF
set -e

# Backup del directorio actual
if [ -d ${SERVER_DIR} ]; then
    sudo mv ${SERVER_DIR} ${SERVER_DIR}.backup.\$(date +%Y%m%d_%H%M%S)
fi

# Crear nuevo directorio
sudo mkdir -p ${SERVER_DIR}
sudo chown ${SERVER_USER}:${SERVER_USER} ${SERVER_DIR}

# Extraer código
cd ${SERVER_DIR}
sudo -u ${SERVER_USER} tar -xzf /tmp/frontend.tar.gz
rm /tmp/frontend.tar.gz

# Instalar dependencias
echo "Instalando dependencias..."
sudo -u ${SERVER_USER} npm install

# Compilar aplicación
echo "Compilando aplicación..."
sudo -u ${SERVER_USER} npm run build

# Reiniciar Nginx
echo "Reiniciando Nginx..."
sudo systemctl reload nginx

echo "Deployment completado!"
EOF

# Limpiar
rm -rf $TEMP_DIR

echo ""
echo "========================================="
echo "Deployment completado exitosamente"
echo "========================================="
echo "Servidor: ${SERVER_HOST}"
echo "Directorio: ${SERVER_DIR}"
echo ""
echo "Verificar estado:"
echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'sudo systemctl status nginx'"
echo "========================================="

