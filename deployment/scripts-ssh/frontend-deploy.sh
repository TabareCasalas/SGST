#!/bin/bash
# Script de deployment para servidor de Frontend
# Ejecutar directamente desde SSH

set -e

echo "========================================="
echo "Deployment de Frontend SGST"
echo "========================================="

# Variables configurables (configurar antes de ejecutar)
GIT_REPO="https://github.com/TabareCasalas/SGST.git"
GIT_BRANCH="taba-branch"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"

# Valor por defecto si no está configurado
BACKEND_URL="${BACKEND_URL:-http://35.199.81.198:3001}"

# Actualizar sistema
echo "Actualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
echo "Instalando dependencias..."
sudo apt install -y curl wget git build-essential nginx

# Instalar Node.js
echo "Instalando Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Clonar repositorio
echo "Clonando repositorio..."
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR
git clone -b $GIT_BRANCH $GIT_REPO sgst
cd sgst

# Crear usuario si no existe
APP_USER="sgst"
APP_DIR="/opt/sgst-frontend"
if ! id "$APP_USER" &>/dev/null; then
    sudo useradd -r -s /bin/false -d $APP_DIR $APP_USER
fi

# Crear directorio de la aplicación
sudo mkdir -p $APP_DIR
sudo chown -R $APP_USER:$APP_USER $APP_DIR

# Copiar código
echo "Copiando código..."
sudo cp -r frontend/* $APP_DIR/
sudo chown -R $APP_USER:$APP_USER $APP_DIR

# Configurar variables de entorno
echo "Configurando variables de entorno..."
sudo -u $APP_USER cat > $APP_DIR/.env.production <<EOF
VITE_API_URL=${BACKEND_URL}
EOF

# Instalar dependencias
echo "Instalando dependencias..."
cd $APP_DIR
sudo -u $APP_USER npm install

# Compilar aplicación
echo "Compilando aplicación React..."
sudo -u $APP_USER npm run build

# Configurar Nginx
echo "Configurando Nginx..."
sudo tee /etc/nginx/sites-available/sgst-frontend > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    root ${APP_DIR}/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Serve static files
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass ${BACKEND_URL};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/sgst-frontend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Configurar firewall
echo "Configurando firewall..."
sudo ufw allow 'Nginx Full' || true
sudo ufw allow OpenSSH || true

# Limpiar
cd /
rm -rf $TEMP_DIR

echo ""
echo "========================================="
echo "Deployment completado"
echo "========================================="
echo "Verificar estado: sudo systemctl status nginx"
echo "Ver logs: sudo tail -f /var/log/nginx/error.log"
echo "URL: http://$(curl -s ifconfig.me)"
echo "========================================="

