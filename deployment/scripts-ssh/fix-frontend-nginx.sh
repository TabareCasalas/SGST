#!/bin/bash
# Script para corregir configuración de Nginx en Frontend

APP_DIR="/opt/sgst-frontend"
BACKEND_URL="${BACKEND_URL:-http://35.199.81.198:3001}"

# Crear configuración de Nginx
echo "Creando configuración de Nginx..."
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
echo "Habilitando sitio..."
sudo ln -sf /etc/nginx/sites-available/sgst-frontend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
echo "Verificando configuración..."
sudo nginx -t

# Reiniciar Nginx
echo "Reiniciando Nginx..."
sudo systemctl restart nginx

echo "✅ Configuración completada"

