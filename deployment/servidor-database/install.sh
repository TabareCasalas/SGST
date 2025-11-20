#!/bin/bash

# Script de instalación de PostgreSQL para SGST
# Ejecutar como: sudo bash install.sh

set -e

echo "========================================="
echo "Instalación de PostgreSQL para SGST"
echo "========================================="

# Variables de configuración
DB_NAME="sgst_db"
DB_USER="sgst_user"
DB_PASSWORD="${POSTGRES_PASSWORD:-sgst_password_change_me}"
CAMUNDA_DB="camunda_db"
POSTGRES_VERSION="15"

# Actualizar sistema
echo "Actualizando sistema..."
apt update && apt upgrade -y

# Instalar PostgreSQL
echo "Instalando PostgreSQL ${POSTGRES_VERSION}..."
apt install -y postgresql-${POSTGRES_VERSION} postgresql-contrib-${POSTGRES_VERSION}

# Iniciar y habilitar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Configurar PostgreSQL
echo "Configurando PostgreSQL..."

# Crear usuario y base de datos
sudo -u postgres psql <<EOF
-- Crear usuario
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';

-- Crear base de datos principal
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};

-- Crear base de datos de Camunda
CREATE DATABASE ${CAMUNDA_DB} OWNER ${DB_USER};

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${CAMUNDA_DB} TO ${DB_USER};

-- Extensión para UUID
\c ${DB_NAME}
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c ${CAMUNDA_DB}
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

# Configurar PostgreSQL para aceptar conexiones remotas
echo "Configurando acceso remoto..."

# Backup de configuración original
cp /etc/postgresql/${POSTGRES_VERSION}/main/postgresql.conf /etc/postgresql/${POSTGRES_VERSION}/main/postgresql.conf.backup
cp /etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf /etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf.backup

# Configurar postgresql.conf
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/${POSTGRES_VERSION}/main/postgresql.conf

# Configurar pg_hba.conf para permitir conexiones desde backend
# IMPORTANTE: Reemplaza <BACKEND_IP> con la IP real del servidor backend
cat >> /etc/postgresql/${POSTGRES_VERSION}/main/pg_hba.conf <<EOF

# Conexiones desde Backend SGST
# host    all             all             <BACKEND_IP>/32         md5
# host    all             all             <CAMUNDA_IP>/32         md5
EOF

# Reiniciar PostgreSQL
systemctl restart postgresql

# Verificar instalación
echo "Verificando instalación..."
sudo -u postgres psql -c "\l" | grep -E "${DB_NAME}|${CAMUNDA_DB}"

echo ""
echo "========================================="
echo "PostgreSQL instalado correctamente"
echo "========================================="
echo "Base de datos: ${DB_NAME}"
echo "Usuario: ${DB_USER}"
echo "Contraseña: ${DB_PASSWORD}"
echo ""
echo "IMPORTANTE:"
echo "1. Cambia la contraseña por defecto"
echo "2. Configura pg_hba.conf con las IPs reales del backend y camunda"
echo "3. Configura firewall de Google Cloud para permitir puerto 5432 solo desde backend"
echo "========================================="

