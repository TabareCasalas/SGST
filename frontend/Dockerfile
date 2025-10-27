# Dockerfile para el Frontend React + Vite
FROM node:20-alpine as builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Imagen de producción con Nginx
FROM nginx:alpine

# Copiar archivos construidos a Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

