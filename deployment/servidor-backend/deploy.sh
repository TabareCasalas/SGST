#!/bin/bash

# Script de deployment del Backend SGST
# Ejecutar desde el directorio raíz del proyecto

set -e

echo "========================================="
echo "Deployment de Backend SGST"
echo "========================================="

# Variables de configuración
SERVER_USER="${SERVER_USER:-sgst}"
SERVER_HOST="${SERVER_HOST:-localhost}"
SERVER_DIR="/opt/sgst-backend"
BACKUP_DIR="/opt/sgst-backend/backups"

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ]; then
    echo "Error: Debes ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# Crear backup del código actual en el servidor
echo "Creando backup..."
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${BACKUP_DIR} && \
    if [ -d ${SERVER_DIR}/src ]; then \
        tar -czf ${BACKUP_DIR}/backend_$(date +%Y%m%d_%H%M%S).tar.gz -C ${SERVER_DIR} .; \
    fi"

# Crear archivo temporal con el código
echo "Preparando archivos..."
TEMP_DIR=$(mktemp -d)
cp -r backend/* $TEMP_DIR/
cd $TEMP_DIR

# Eliminar node_modules y dist si existen (se reinstalarán)
rm -rf node_modules dist

# Crear archivo .gitignore temporal
cat > .gitignore <<EOF
node_modules/
dist/
.env
uploads/*
!uploads/.gitkeep
*.log
EOF

# Comprimir código
echo "Comprimiendo código..."
tar -czf backend.tar.gz .

# Subir al servidor
echo "Subiendo código al servidor..."
scp backend.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/

# Ejecutar deployment en el servidor
echo "Ejecutando deployment en el servidor..."
ssh ${SERVER_USER}@${SERVER_HOST} <<EOF
set -e

# Detener servicio
sudo systemctl stop sgst-backend || true

# Backup del directorio actual
if [ -d ${SERVER_DIR} ]; then
    sudo mv ${SERVER_DIR} ${SERVER_DIR}.backup.\$(date +%Y%m%d_%H%M%S)
fi

# Crear nuevo directorio
sudo mkdir -p ${SERVER_DIR}
sudo chown ${SERVER_USER}:${SERVER_USER} ${SERVER_DIR}

# Extraer código
cd ${SERVER_DIR}
sudo -u ${SERVER_USER} tar -xzf /tmp/backend.tar.gz
rm /tmp/backend.tar.gz

# Restaurar .env si existe backup
if [ -f ${SERVER_DIR}.backup.*/.env ]; then
    sudo cp ${SERVER_DIR}.backup.*/.env ${SERVER_DIR}/.env
    sudo chown ${SERVER_USER}:${SERVER_USER} ${SERVER_DIR}/.env
    sudo chmod 600 ${SERVER_DIR}/.env
fi

# Restaurar uploads si existe
if [ -d ${SERVER_DIR}.backup.*/uploads ]; then
    sudo cp -r ${SERVER_DIR}.backup.*/uploads/* ${SERVER_DIR}/uploads/ 2>/dev/null || true
    sudo chown -R ${SERVER_USER}:${SERVER_USER} ${SERVER_DIR}/uploads
fi

# Instalar dependencias
echo "Instalando dependencias..."
sudo -u ${SERVER_USER} npm install --production

# Generar Prisma Client
echo "Generando Prisma Client..."
sudo -u ${SERVER_USER} npx prisma generate

# Compilar TypeScript
echo "Compilando TypeScript..."
sudo -u ${SERVER_USER} npm run build

# Ejecutar migraciones
echo "Ejecutando migraciones..."
sudo -u ${SERVER_USER} npx prisma migrate deploy

# Reiniciar servicio
echo "Reiniciando servicio..."
sudo systemctl start sgst-backend
sudo systemctl status sgst-backend

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
echo "  ssh ${SERVER_USER}@${SERVER_HOST} 'sudo systemctl status sgst-backend'"
echo "========================================="

