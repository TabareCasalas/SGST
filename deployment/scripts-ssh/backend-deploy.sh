#!/bin/bash
# Script de deployment para servidor de Backend
# Ejecutar directamente desde SSH

set -e

echo "========================================="
echo "Deployment de Backend SGST"
echo "========================================="

# Variables configurables (configurar antes de ejecutar)
GIT_REPO="https://github.com/TabareCasalas/SGST.git"
GIT_BRANCH="taba-branch"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-sgst_db}"
DB_USER="${DB_USER:-sgst_user}"
DB_PASSWORD="${DB_PASSWORD:-change_me}"
ORCHESTRATOR_URL="${ORCHESTRATOR_URL:-http://localhost:3002}"
ORCHESTRATOR_TOKEN="${ORCHESTRATOR_TOKEN:-change_me}"
JWT_SECRET="${JWT_SECRET:-change_me}"
REFRESH_SECRET="${REFRESH_SECRET:-change_me}"

# Valores por defecto si no están configurados (para deployment automático)
DB_HOST="${DB_HOST:-35.199.81.198}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-sgst_db}"
DB_USER="${DB_USER:-sgst_user}"
DB_PASSWORD="${DB_PASSWORD:-sgst_password}"
ORCHESTRATOR_URL="${ORCHESTRATOR_URL:-http://35.198.59.98:3002}"
ORCHESTRATOR_TOKEN="${ORCHESTRATOR_TOKEN:-aB3xK9mP2vQ7wR5tY8uI1oE4nM6cL0dF9gH2jK5sA8bC1eD4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4}"
JWT_SECRET="${JWT_SECRET:-xY9zA2bC5dE8fG1hI4jK7lM0nO3pQ6rS9tU2vW5xY8zA1bC4dE7fG0hI3jK6lM9nO2pQ5rS8tU1vW4xY7zA0}"
REFRESH_SECRET="${REFRESH_SECRET:-mN6pQ9rS2tU5vW8xY1zA4bC7dE0fG3hI6jK9lM2nO5pQ8rS1tU4vW7xY0zA3bC6dE9fG2hI5jK8lM1nO4pQ7rS0tU3vW6xY9zA2}"

# Actualizar sistema
echo "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
echo "Instalando dependencias..."
sudo apt install -y curl wget git build-essential

# Instalar Node.js
echo "Instalando Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Instalar PM2
echo "Instalando PM2..."
sudo npm install -g pm2

# Clonar repositorio
echo "Clonando repositorio..."
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR
git clone -b $GIT_BRANCH $GIT_REPO sgst
cd sgst

# Crear usuario si no existe
APP_USER="sgst"
APP_DIR="/opt/sgst-backend"
if ! id "$APP_USER" &>/dev/null; then
    sudo useradd -r -s /bin/false -d $APP_DIR $APP_USER
fi

# Crear directorio de la aplicación
sudo mkdir -p $APP_DIR
sudo mkdir -p $APP_DIR/uploads
sudo chown -R $APP_USER:$APP_USER $APP_DIR

# Copiar código
echo "Copiando código..."
sudo cp -r backend/* $APP_DIR/
sudo chown -R $APP_USER:$APP_USER $APP_DIR

# Instalar dependencias
echo "Instalando dependencias..."
cd $APP_DIR
sudo -u $APP_USER npm install --production

# Generar Prisma Client
echo "Generando Prisma Client..."
sudo -u $APP_USER npx prisma generate

# Compilar TypeScript
echo "Compilando TypeScript..."
sudo -u $APP_USER npm run build

# Crear archivo .env
echo "Creando archivo .env..."
sudo -u $APP_USER cat > $APP_DIR/.env <<EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
JWT_SECRET=${JWT_SECRET}
REFRESH_SECRET=${REFRESH_SECRET}
ORCHESTRATOR_URL=${ORCHESTRATOR_URL}
ORCHESTRATOR_TOKEN=${ORCHESTRATOR_TOKEN}
EOF
sudo chmod 600 $APP_DIR/.env

# Ejecutar migraciones
echo "Ejecutando migraciones..."
sudo -u $APP_USER npx prisma migrate deploy

# Configurar PM2
echo "Configurando PM2..."
sudo -u $APP_USER pm2 start $APP_DIR/dist/index.js --name sgst-backend
sudo -u $APP_USER pm2 save
sudo -u $APP_USER pm2 startup systemd -u $APP_USER --hp $APP_DIR | grep "sudo" | bash || true

# Configurar systemd service
echo "Configurando servicio systemd..."
sudo tee /etc/systemd/system/sgst-backend.service > /dev/null <<EOF
[Unit]
Description=SGST Backend API
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/pm2 start sgst-backend --no-daemon
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=sgst-backend

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable sgst-backend
sudo systemctl start sgst-backend

# Configurar firewall
echo "Configurando firewall..."
sudo ufw allow 3001/tcp || true

# Limpiar
cd /
rm -rf $TEMP_DIR

echo ""
echo "========================================="
echo "Deployment completado"
echo "========================================="
echo "Verificar estado: sudo systemctl status sgst-backend"
echo "Ver logs: sudo journalctl -u sgst-backend -f"
echo "========================================="

