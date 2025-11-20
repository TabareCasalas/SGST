# Deployment - Servidor de Frontend

Este documento explica cómo desplegar el Frontend SGST en el servidor.

## Requisitos

- Ubuntu 22.04 LTS
- Acceso root o sudo
- Mínimo 1GB RAM
- 5GB espacio en disco
- Acceso al servidor de backend

## Instalación Inicial

### Paso 1: Preparar servidor

```bash
# Conectarse al servidor
ssh usuario@<IP_SERVIDOR_FRONTEND>

# Subir archivos de instalación
scp -r deployment/servidor-frontend/* usuario@<IP_SERVIDOR_FRONTEND>:/tmp/sgst-frontend/
```

### Paso 2: Configurar URL del backend

Antes de ejecutar el script de instalación:

```bash
export BACKEND_URL="http://<IP_SERVIDOR_BACKEND>:3001"
```

### Paso 3: Copiar código del frontend

```bash
# Desde tu máquina local, copiar el directorio frontend
scp -r frontend/* usuario@<IP_SERVIDOR_FRONTEND>:/tmp/sgst-frontend/
```

### Paso 4: Ejecutar instalación

```bash
# En el servidor
cd /tmp/sgst-frontend
chmod +x install.sh
sudo bash install.sh
```

### Paso 5: Verificar instalación

```bash
# Ver estado de Nginx
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Probar en navegador
curl http://localhost
```

## Deployment de Actualizaciones

### Opción 1: Script automatizado (recomendado)

```bash
# Desde tu máquina local, en el directorio raíz del proyecto
export SERVER_USER="sgst"
export SERVER_HOST="<IP_SERVIDOR_FRONTEND>"
export BACKEND_URL="http://<IP_SERVIDOR_BACKEND>:3001"

chmod +x deployment/servidor-frontend/deploy.sh
./deployment/servidor-frontend/deploy.sh
```

### Opción 2: Manual

```bash
# 1. Conectarse al servidor
ssh sgst@<IP_SERVIDOR_FRONTEND>

# 2. Hacer backup
sudo cp -r /opt/sgst-frontend /opt/sgst-frontend.backup.$(date +%Y%m%d)

# 3. Subir nuevo código (desde tu máquina local)
scp -r frontend/* sgst@<IP_SERVIDOR_FRONTEND>:/opt/sgst-frontend/

# 4. En el servidor, instalar dependencias y compilar
cd /opt/sgst-frontend
sudo -u sgst npm install
sudo -u sgst npm run build

# 5. Reiniciar Nginx
sudo systemctl reload nginx
```

## Configuración de Firewall

En Google Cloud Console:

1. Ve a **VPC network** > **Firewall rules**
2. Crea regla:
   - **Name**: `allow-http-https`
   - **Direction**: Ingress
   - **Targets**: All instances in the network
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: TCP 80, 443
   - **Action**: Allow

## Configuración de SSL/TLS (Opcional pero recomendado)

### Usando Let's Encrypt con Certbot

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado (reemplaza con tu dominio)
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo certbot renew --dry-run
```

## Configuración de Nginx

El archivo de configuración está en `/etc/nginx/sites-available/sgst-frontend`.

Para editar:

```bash
sudo nano /etc/nginx/sites-available/sgst-frontend
sudo nginx -t  # Verificar configuración
sudo systemctl reload nginx  # Aplicar cambios
```

## Variables de Entorno

El archivo `.env.production` se encuentra en `/opt/sgst-frontend/.env.production`:

```env
VITE_API_URL=http://<IP_BACKEND>:3001
```

## Monitoreo

### Ver logs

```bash
# Logs de acceso
sudo tail -f /var/log/nginx/access.log

# Logs de error
sudo tail -f /var/log/nginx/error.log
```

### Ver estado

```bash
# Estado de Nginx
sudo systemctl status nginx

# Verificar configuración
sudo nginx -t
```

## Troubleshooting

### Nginx no inicia

```bash
# Ver logs de error
sudo journalctl -u nginx -n 50

# Verificar configuración
sudo nginx -t

# Verificar permisos
sudo chown -R sgst:sgst /opt/sgst-frontend/dist
```

### Error 502 Bad Gateway

1. Verificar que el backend esté corriendo
2. Verificar que la URL del backend en `.env.production` sea correcta
3. Verificar conectividad: `curl http://<IP_BACKEND>:3001/health`

### La aplicación no carga

1. Verificar que la compilación se haya completado: `ls -la /opt/sgst-frontend/dist`
2. Verificar permisos: `sudo chown -R sgst:sgst /opt/sgst-frontend`
3. Ver logs de Nginx: `sudo tail -f /var/log/nginx/error.log`

## Optimización

### Habilitar compresión Gzip

Ya está habilitado en la configuración por defecto.

### Cache de archivos estáticos

Ya está configurado en la configuración por defecto.

### CDN (Opcional)

Para producción, considera usar un CDN como Cloudflare o Google Cloud CDN.

## Backup

Los backups se crean automáticamente antes de cada deployment en `/opt/sgst-frontend/backups/`.

Para backup manual:

```bash
sudo tar -czf /backup/frontend_$(date +%Y%m%d).tar.gz -C /opt/sgst-frontend .
```

