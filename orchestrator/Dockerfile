FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json* ./

# Instalar dependencias (incluyendo devDependencies para TypeScript)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3002

# Iniciar aplicación
CMD ["npm", "start"]

