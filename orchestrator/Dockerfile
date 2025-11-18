FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
RUN npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3002

# Iniciar aplicación
CMD ["npm", "start"]

