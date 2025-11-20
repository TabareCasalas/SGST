# Deployment - Servidor de Backend

Este documento explica cómo desplegar el Backend SGST en el servidor.

## Requisitos

- Ubuntu 22.04 LTS
- Acceso root o sudo
- Mínimo 2GB RAM
- 10GB espacio en disco
- Acceso al servidor de base de datos

## Instalación Inicial

### Paso 1: Preparar servidor

```bash
# Conectarse al servidor
ssh usuario@<IP_SERVIDOR_BACKEND>

# Subir archivos de instalación
scp -r deployment/servidor-backend/* usuario@<IP_SERVIDOR_BACKEND>:/tmp/sgst-backend/
```

### Paso 2: Configurar variables de entorno

Antes de ejecutar el script de instalación, configura las variables:

```bash
export DB_HOST="<IP_SERVIDOR_DB>"
export DB_PORT="5432"
export DB_NAME="sgst_db"
export DB_USER="sgst_user"
export DB_PASSWORD="tu_contraseña_segura"
export ORCHESTRATOR_URL="http://<IP_SERVIDOR_CAMUNDA>:3002"
export ORCHESTRATOR_TOKEN="tu_token_seguro"
export JWT_SECRET="tu_jwt_secret_muy_seguro"
export REFRESH_SECRET="tu_refresh_secret_muy_seguro"
```

### Paso 3: Copiar código del backend

```bash
# Desde tu máquina local, copiar el directorio backend
scp -r backend/* usuario@<IP_SERVIDOR_BACKEND>:/tmp/sgst-backend/
```

### Paso 4: Ejecutar instalación

```bash
# En el servidor
cd /tmp/sgst-backend
chmod +x install.sh
sudo bash install.sh
```

### Paso 5: Verificar instalación

```bash
# Ver estado del servicio
sudo systemctl status sgst-backend

# Ver logs
sudo journalctl -u sgst-backend -f

# Probar endpoint
curl http://localhost:3001/health
```

## Deployment de Actualizaciones

### Opción 1: Script automatizado (recomendado)

```bash
# Desde tu máquina local, en el directorio raíz del proyecto
export SERVER_USER="sgst"
export SERVER_HOST="<IP_SERVIDOR_BACKEND>"

chmod +x deployment/servidor-backend/deploy.sh
./deployment/servidor-backend/deploy.sh
```

### Opción 2: Manual

```bash
# 1. Conectarse al servidor
ssh sgst@<IP_SERVIDOR_BACKEND>

# 2. Detener servicio
sudo systemctl stop sgst-backend

# 3. Hacer backup
sudo cp -r /opt/sgst-backend /opt/sgst-backend.backup.$(date +%Y%m%d)

# 4. Subir nuevo código (desde tu máquina local)
scp -r backend/* sgst@<IP_SERVIDOR_BACKEND>:/opt/sgst-backend/

# 5. En el servidor, instalar dependencias y compilar
cd /opt/sgst-backend
sudo -u sgst npm install --production
sudo -u sgst npx prisma generate
sudo -u sgst npm run build
sudo -u sgst npx prisma migrate deploy

# 6. Reiniciar servicio
sudo systemctl start sgst-backend
```

## Configuración de Firewall

En Google Cloud Console:

1. Ve a **VPC network** > **Firewall rules**
2. Crea regla:
   - **Name**: `allow-backend-api`
   - **Direction**: Ingress
   - **Targets**: All instances in the network
   - **Source IP ranges**: `0.0.0.0/0` (o solo IPs del frontend)
   - **Protocols and ports**: TCP 3001
   - **Action**: Allow

## Variables de Entorno

El archivo `.env` se encuentra en `/opt/sgst-backend/.env`:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://sgst_user:password@<IP_DB>:5432/sgst_db
JWT_SECRET=tu_jwt_secret_muy_seguro
REFRESH_SECRET=tu_refresh_secret_muy_seguro
ORCHESTRATOR_URL=http://<IP_CAMUNDA>:3002
ORCHESTRATOR_TOKEN=tu_token_seguro
```

## Monitoreo

### Ver logs

```bash
# Logs del sistema
sudo journalctl -u sgst-backend -f

# Logs de PM2
sudo -u sgst pm2 logs sgst-backend
```

### Ver estado

```bash
# Estado del servicio
sudo systemctl status sgst-backend

# Estado de PM2
sudo -u sgst pm2 status
```

## Troubleshooting

### El servicio no inicia

```bash
# Ver logs de error
sudo journalctl -u sgst-backend -n 50

# Verificar permisos
sudo chown -R sgst:sgst /opt/sgst-backend

# Verificar .env
sudo cat /opt/sgst-backend/.env
```

### Error de conexión a base de datos

1. Verificar que PostgreSQL esté accesible desde el backend
2. Verificar credenciales en `.env`
3. Probar conexión: `psql -h <IP_DB> -U sgst_user -d sgst_db`

### Error de compilación

```bash
# Limpiar y reinstalar
cd /opt/sgst-backend
sudo -u sgst rm -rf node_modules dist
sudo -u sgst npm install
sudo -u sgst npm run build
```

## Backup

Los backups se crean automáticamente antes de cada deployment en `/opt/sgst-backend/backups/`.

Para backup manual:

```bash
sudo tar -czf /backup/backend_$(date +%Y%m%d).tar.gz -C /opt/sgst-backend .
```

