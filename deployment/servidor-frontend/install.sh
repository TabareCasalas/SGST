#!/bin/bash

# Script de instalación de Frontend SGST
# Ejecutar como: sudo bash install.sh

set -e

echo "========================================="
echo "Instalación de Frontend SGST"
echo "========================================="

# Variables de configuración
APP_USER="sgst"
APP_DIR="/opt/sgst-frontend"
NGINX_DIR="/etc/nginx/sites-available"
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"

# Actualizar sistema
echo "Actualizando sistema..."
apt update && apt upgrade -y

# Instalar dependencias
echo "Instalando dependencias..."
apt install -y curl wget git build-essential

# Instalar Node.js usando NodeSource
echo "Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar Nginx
echo "Instalando Nginx..."
apt install -y nginx

# Crear usuario para la aplicación
echo "Creando usuario ${APP_USER}..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -r -s /bin/false -d $APP_DIR $APP_USER
fi

# Crear directorio de la aplicación
mkdir -p $APP_DIR
chown -R $APP_USER:$APP_USER $APP_DIR

# Copiar archivos de la aplicación
echo "Copiando archivos de la aplicación..."
# NOTA: Los archivos deben estar en el directorio actual
# o se deben copiar manualmente antes de ejecutar este script

# Instalar dependencias
echo "Instalando dependencias de Node.js..."
cd $APP_DIR
npm install

# Configurar variables de entorno para build
echo "Configurando variables de entorno..."
cat > $APP_DIR/.env.production <<EOF
VITE_API_URL=${BACKEND_URL}
EOF

# Compilar aplicación
echo "Compilando aplicación React..."
npm run build

# Configurar Nginx
echo "Configurando Nginx..."
cat > ${NGINX_DIR}/sgst-frontend <<EOF
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
ln -sf ${NGINX_DIR}/sgst-frontend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración de Nginx
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# Configurar firewall
echo "Configurando firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

echo ""
echo "========================================="
echo "Frontend instalado correctamente"
echo "========================================="
echo "Directorio: $APP_DIR"
echo "Usuario: $APP_USER"
echo "Nginx configurado en puerto 80"
echo ""
echo "Comandos útiles:"
echo "  Ver logs de Nginx: sudo tail -f /var/log/nginx/error.log"
echo "  Reiniciar Nginx: sudo systemctl restart nginx"
echo "  Estado: sudo systemctl status nginx"
echo "========================================="

