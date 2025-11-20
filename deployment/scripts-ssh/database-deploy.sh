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

# Detectar si necesitamos sudo
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

# Actualizar sistema
echo "Actualizando sistema..."
$SUDO apt update && $SUDO apt upgrade -y

# Instalar dependencias (incluyendo git)
echo "Instalando dependencias..."
$SUDO apt install -y curl wget git

# Agregar repositorio oficial de PostgreSQL
echo "Agregando repositorio oficial de PostgreSQL..."
$SUDO apt install -y lsb-release gnupg2
$SUDO mkdir -p /etc/apt/keyrings
$SUDO wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | $SUDO gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg
$SUDO sh -c 'echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
$SUDO apt update

# Instalar PostgreSQL
echo "Instalando PostgreSQL ${POSTGRES_VERSION}..."
$SUDO apt install -y postgresql-${POSTGRES_VERSION} postgresql-contrib-${POSTGRES_VERSION}

# Clonar repositorio
echo "Clonando repositorio..."
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR
git clone -b $GIT_BRANCH $GIT_REPO sgst
cd sgst

# Verificar que el directorio existe
if [ ! -d "deployment/servidor-database" ]; then
    echo "ERROR: No se encontró el directorio deployment/servidor-database"
    echo "Verificando estructura del repositorio..."
    ls -la
    ls -la deployment/ 2>/dev/null || echo "Directorio deployment no existe"
    exit 1
fi

# Ejecutar instalación directamente (sin usar install.sh externo)
echo "Ejecutando instalación..."

# Crear usuario y base de datos
echo "Creando usuario y bases de datos..."
runuser -l postgres -c "psql -c \"CREATE USER ${DB_USER:-sgst_user} WITH PASSWORD '${DB_PASSWORD}';\" 2>/dev/null || psql -c \"ALTER USER ${DB_USER:-sgst_user} WITH PASSWORD '${DB_PASSWORD}';\""

runuser -l postgres -c "psql -c \"CREATE DATABASE ${DB_NAME:-sgst_db} OWNER ${DB_USER:-sgst_user};\" 2>/dev/null || true"
runuser -l postgres -c "psql -c \"CREATE DATABASE ${CAMUNDA_DB:-camunda_db} OWNER ${DB_USER:-sgst_user};\" 2>/dev/null || true"

runuser -l postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME:-sgst_db} TO ${DB_USER:-sgst_user};\""
runuser -l postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE ${CAMUNDA_DB:-camunda_db} TO ${DB_USER:-sgst_user};\""

# Configurar PostgreSQL para aceptar conexiones remotas
echo "Configurando acceso remoto..."
if ! grep -q "listen_addresses = '*'" /etc/postgresql/${POSTGRES_VERSION}/main/postgresql.conf; then
    $SUDO sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/${POSTGRES_VERSION}/main/postgresql.conf
    $SUDO sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/${POSTGRES_VERSION}/main/postgresql.conf
fi

# Configurar pg_hba.conf
echo "Configurando pg_hba.conf..."
if ! grep -q "35.199.81.198" /etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf; then
    echo "" | $SUDO tee -a /etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf > /dev/null
    echo "# Conexiones desde Backend SGST" | $SUDO tee -a /etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf > /dev/null
    echo "host    all             all             35.199.81.198/32         md5" | $SUDO tee -a /etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf > /dev/null
    echo "" | $SUDO tee -a /etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf > /dev/null
    echo "# Conexiones desde Camunda" | $SUDO tee -a /etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf > /dev/null
    echo "host    all             all             35.198.59.98/32         md5" | $SUDO tee -a /etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf > /dev/null
fi

# Reiniciar PostgreSQL
echo "Reiniciando PostgreSQL..."
$SUDO systemctl restart postgresql
$SUDO systemctl enable postgresql

# Crear extensiones
runuser -l postgres -c "psql -d ${DB_NAME:-sgst_db} -c \"CREATE EXTENSION IF NOT EXISTS uuid-ossp;\"" 2>/dev/null || true
runuser -l postgres -c "psql -d ${CAMUNDA_DB:-camunda_db} -c \"CREATE EXTENSION IF NOT EXISTS uuid-ossp;\"" 2>/dev/null || true

# Verificar instalación
echo "Verificando instalación..."
runuser -l postgres -c "psql -c \"\\l\"" | grep -E "${DB_NAME:-sgst_db}|${CAMUNDA_DB:-camunda_db}" || true

# Limpiar
cd /
rm -rf $TEMP_DIR

echo ""
echo "========================================="
echo "Deployment completado"
echo "========================================="
echo "Base de datos: ${DB_NAME:-sgst_db}"
echo "Usuario: ${DB_USER:-sgst_user}"
echo "Contraseña: ${DB_PASSWORD}"
echo ""
echo "pg_hba.conf configurado con IPs:"
echo "  - Backend: 35.199.81.198"
echo "  - Camunda: 35.198.59.98"
echo "========================================="

