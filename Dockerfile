# Multi-stage build para Frontend React
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias del frontend
COPY frontend/package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copiar archivos de configuración TypeScript desde la raíz
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./

# Copiar código fuente del frontend
COPY frontend/ ./

# Configurar variables de entorno para build (se pueden sobrescribir)
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

# Compilar aplicación
# Usamos npx vite build para ejecutar vite desde node_modules
# Vite maneja TypeScript internamente, no necesitamos tsc por separado
RUN npx vite build

# Stage 2: Nginx para servir la aplicación
FROM nginx:alpine

# Copiar archivos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear configuración de nginx personalizada
RUN cat > /etc/nginx/conf.d/default.conf <<'NGINX_EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
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
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

