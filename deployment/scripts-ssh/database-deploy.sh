#!/bin/bash
# Script de deployment para servidor de Base de Datos
# Ejecutar directamente desde SSH

set -e

echo "========================================="
echo "Deployment de Base de Datos SGST"
echo "========================================="

# Variables configurables
GIT_REPO="https://github.com/TabareCasalas/SGST.git"
GIT_BRANCH="taba-branch"
DB_PASSWORD="${DB_PASSWORD:-sgst_password}"
POSTGRES_VERSION="15"

# Actualizar sistema
echo "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
echo "Instalando dependencias..."
sudo apt install -y curl wget git postgresql-${POSTGRES_VERSION} postgresql-contrib-${POSTGRES_VERSION}

# Clonar repositorio
echo "Clonando repositorio..."
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR
git clone -b $GIT_BRANCH $GIT_REPO sgst
cd sgst

# Ejecutar script de instalación
echo "Ejecutando instalación..."
chmod +x deployment/servidor-database/install.sh
sudo DB_PASSWORD="$DB_PASSWORD" bash deployment/servidor-database/install.sh

# Limpiar
cd /
rm -rf $TEMP_DIR

echo ""
echo "========================================="
echo "Deployment completado"
echo "========================================="
echo "IMPORTANTE:"
echo "1. Configura pg_hba.conf con las IPs del backend y camunda"
echo "2. Configura firewall de Google Cloud"
echo "3. Cambia la contraseña por defecto"
echo "========================================="

