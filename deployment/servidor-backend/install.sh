#!/bin/bash

# Script de instalación de Backend SGST
# Ejecutar como: sudo bash install.sh

set -e

echo "========================================="
echo "Instalación de Backend SGST"
echo "========================================="

# Variables de configuración
APP_USER="sgst"
APP_DIR="/opt/sgst-backend"
SERVICE_NAME="sgst-backend"
NODE_VERSION="18"

# Obtener IPs de servidores (configurar antes de ejecutar)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-sgst_db}"
DB_USER="${DB_USER:-sgst_user}"
DB_PASSWORD="${DB_PASSWORD:-change_me}"
ORCHESTRATOR_URL="${ORCHESTRATOR_URL:-http://localhost:3002}"
ORCHESTRATOR_TOKEN="${ORCHESTRATOR_TOKEN:-change_me}"
JWT_SECRET="${JWT_SECRET:-change_me}"
REFRESH_SECRET="${REFRESH_SECRET:-change_me}"

# Actualizar sistema
echo "Actualizando sistema..."
apt update && apt upgrade -y

# Instalar dependencias
echo "Instalando dependencias..."
apt install -y curl wget git build-essential

# Instalar Node.js usando NodeSource
echo "Instalando Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Verificar instalación
node --version
npm --version

# Crear usuario para la aplicación
echo "Creando usuario ${APP_USER}..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -r -s /bin/false -d $APP_DIR $APP_USER
fi

# Crear directorio de la aplicación
mkdir -p $APP_DIR
mkdir -p $APP_DIR/uploads
chown -R $APP_USER:$APP_USER $APP_DIR

# Instalar PM2 para gestión de procesos
echo "Instalando PM2..."
npm install -g pm2

# Copiar archivos de la aplicación
echo "Copiando archivos de la aplicación..."
# NOTA: Los archivos deben estar en el directorio actual
# o se deben copiar manualmente antes de ejecutar este script

# Instalar dependencias
echo "Instalando dependencias de Node.js..."
cd $APP_DIR
npm install --production

# Generar Prisma Client
echo "Generando Prisma Client..."
npx prisma generate

# Compilar TypeScript
echo "Compilando TypeScript..."
npm run build

# Crear archivo .env
echo "Creando archivo .env..."
cat > $APP_DIR/.env <<EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
JWT_SECRET=${JWT_SECRET}
REFRESH_SECRET=${REFRESH_SECRET}
ORCHESTRATOR_URL=${ORCHESTRATOR_URL}
ORCHESTRATOR_TOKEN=${ORCHESTRATOR_TOKEN}
EOF

chown $APP_USER:$APP_USER $APP_DIR/.env
chmod 600 $APP_DIR/.env

# Ejecutar migraciones de Prisma
echo "Ejecutando migraciones de base de datos..."
sudo -u $APP_USER npx prisma migrate deploy

# Configurar PM2
echo "Configurando PM2..."
sudo -u $APP_USER pm2 start $APP_DIR/dist/index.js --name $SERVICE_NAME
sudo -u $APP_USER pm2 save
sudo -u $APP_USER pm2 startup systemd -u $APP_USER --hp $APP_DIR

# Configurar systemd service
echo "Configurando servicio systemd..."
cat > /etc/systemd/system/${SERVICE_NAME}.service <<EOF
[Unit]
Description=SGST Backend API
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/pm2 start $SERVICE_NAME --no-daemon
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ${SERVICE_NAME}
systemctl start ${SERVICE_NAME}

# Configurar firewall (si es necesario)
echo "Configurando firewall..."
ufw allow 3001/tcp

echo ""
echo "========================================="
echo "Backend instalado correctamente"
echo "========================================="
echo "Directorio: $APP_DIR"
echo "Usuario: $APP_USER"
echo "Servicio: $SERVICE_NAME"
echo ""
echo "Comandos útiles:"
echo "  Ver logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  Reiniciar: sudo systemctl restart $SERVICE_NAME"
echo "  Estado: sudo systemctl status $SERVICE_NAME"
echo "========================================="

