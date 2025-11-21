# Guía de Deployment Automatizado

Este documento explica cómo desplegar la aplicación SGST en un servidor de Google Cloud usando el script automatizado.

## Requisitos Previos

1. **Acceso SSH al servidor**: Debes tener acceso SSH al servidor de Google Cloud
2. **Clave SSH configurada**: Tu clave SSH debe estar agregada al servidor
3. **Servidor con Ubuntu/Debian**: El script está optimizado para sistemas basados en Debian

## Configuración Inicial del Servidor

### 1. Conectarse al servidor

```bash
ssh usuario@35.199.81.198
```

Reemplaza `usuario` con tu usuario SSH. Si es la primera vez, Google Cloud te proporcionará el comando exacto.

### 2. Verificar acceso

Asegúrate de poder conectarte sin problemas antes de ejecutar el script.

## Deployment Automatizado

### Opción 1: Desde tu máquina local (Recomendado)

El script se conecta al servidor y ejecuta todo automáticamente:

```bash
# Hacer el script ejecutable
chmod +x deploy.sh

# Ejecutar el deployment
./deploy.sh [usuario_ssh] [ip_servidor]
```

**Ejemplo:**
```bash
./deploy.sh tu_usuario 35.199.81.198
```

Si no especificas usuario o IP, usará valores por defecto:
- Usuario: tu usuario actual (`$USER`)
- IP: `35.199.81.198`

### Opción 2: Ejecutar directamente en el servidor

Si prefieres ejecutar el script directamente en el servidor:

```bash
# 1. Conectarse al servidor
ssh usuario@35.199.81.198

# 2. Clonar el repositorio
cd /opt
sudo git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst
cd sgst

# 3. Hacer el script ejecutable
chmod +x deploy.sh

# 4. Ejecutar (solo la parte del servidor)
# Nota: Necesitarías modificar el script para extraer solo la parte del servidor
```

## ¿Qué hace el script?

El script automatiza los siguientes pasos:

1. **Verifica conexión SSH** al servidor
2. **Actualiza el sistema** operativo
3. **Instala dependencias** básicas (curl, wget, git, etc.)
4. **Instala Docker** y Docker Compose si no están instalados
5. **Clona/Actualiza el repositorio** desde GitHub
6. **Configura variables de entorno** (crea `.env` desde `env.example`)
7. **Configura el firewall** (abre puertos necesarios)
8. **Construye y levanta** todos los contenedores con Docker Compose
9. **Verifica el estado** de los servicios

## Puertos Utilizados

La aplicación utiliza los siguientes puertos:

- **80**: Frontend (React)
- **3001**: Backend API
- **3002**: Orchestrator
- **5432**: PostgreSQL (solo interno)
- **8080**: PgAdmin (administración de BD)
- **8081**: Camunda Operate
- **8082**: Camunda Tasklist
- **8083**: Camunda Identity
- **26500**: Zeebe Gateway
- **9200**: Elasticsearch (solo interno)

## Acceso a la Aplicación

Una vez completado el deployment, la aplicación estará disponible en:

- **Frontend**: http://35.199.81.198
- **Backend API**: http://35.199.81.198:3001
- **Camunda Operate**: http://35.199.81.198:8081
- **Camunda Tasklist**: http://35.199.81.198:8082
- **Camunda Identity**: http://35.199.81.198:8083
- **PgAdmin**: http://35.199.81.198:8080

## Comandos Útiles

### Ver logs de todos los servicios
```bash
ssh usuario@35.199.81.198 'cd /opt/sgst && docker compose logs -f'
```

### Ver logs de un servicio específico
```bash
ssh usuario@35.199.81.198 'cd /opt/sgst && docker compose logs -f backend'
```

### Ver estado de los contenedores
```bash
ssh usuario@35.199.81.198 'cd /opt/sgst && docker compose ps'
```

### Reiniciar un servicio
```bash
ssh usuario@35.199.81.198 'cd /opt/sgst && docker compose restart backend'
```

### Detener todos los servicios
```bash
ssh usuario@35.199.81.198 'cd /opt/sgst && docker compose down'
```

### Iniciar servicios
```bash
ssh usuario@35.199.81.81.198 'cd /opt/sgst && docker compose up -d'
```

### Actualizar la aplicación (pull y rebuild)
```bash
ssh usuario@35.199.81.198 'cd /opt/sgst && git pull && docker compose down && docker compose build --no-cache && docker compose up -d'
```

## Configuración de Variables de Entorno

El script crea automáticamente un archivo `.env` desde `env.example`. Si necesitas modificar la configuración:

```bash
ssh usuario@35.199.81.198
cd /opt/sgst
nano .env
# Hacer cambios
docker compose restart
```

### Variables importantes a revisar:

- `POSTGRES_PASSWORD`: Contraseña de la base de datos
- `JWT_SECRET`: Secret para tokens JWT (generado automáticamente)
- `REFRESH_SECRET`: Secret para refresh tokens (generado automáticamente)
- `ORCHESTRATOR_TOKEN`: Token de comunicación con el orchestrator
- `PGADMIN_PASSWORD`: Contraseña de PgAdmin

## Troubleshooting

### Error: "Permission denied" al ejecutar Docker

Si obtienes errores de permisos con Docker, ejecuta:

```bash
ssh usuario@35.199.81.198
sudo usermod -aG docker $USER
# Luego cierra sesión y vuelve a conectarte
```

### Error: "Cannot connect to Docker daemon"

El servicio de Docker puede no estar corriendo:

```bash
ssh usuario@35.199.81.198
sudo systemctl start docker
sudo systemctl enable docker
```

### Ver logs de errores

```bash
ssh usuario@35.199.81.198 'cd /opt/sgst && docker compose logs --tail=100'
```

### Reiniciar todo desde cero

```bash
ssh usuario@35.199.81.198
cd /opt/sgst
docker compose down -v  # Elimina también los volúmenes
sudo rm -rf /opt/sgst
# Luego ejecuta el script deploy.sh nuevamente
```

### Verificar uso de recursos

```bash
ssh usuario@35.199.81.198
docker stats
```

## Seguridad

⚠️ **Importante**: 

1. Cambia las contraseñas por defecto en el archivo `.env`
2. Configura un firewall adecuado (el script configura UFW básico)
3. Considera usar HTTPS con un proxy reverso (Nginx/Traefik)
4. No expongas PgAdmin públicamente en producción
5. Revisa los secrets generados automáticamente

## Actualización de la Aplicación

Para actualizar la aplicación con los últimos cambios:

```bash
# Opción 1: Ejecutar el script nuevamente (recomendado)
./deploy.sh usuario 35.199.81.198

# Opción 2: Manualmente
ssh usuario@35.199.81.198
cd /opt/sgst
git pull origin taba-branch
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Soporte

Si encuentras problemas durante el deployment:

1. Revisa los logs: `docker compose logs`
2. Verifica el estado de los contenedores: `docker compose ps`
3. Revisa la configuración: `cat /opt/sgst/.env`
4. Verifica los recursos del servidor: `docker stats`

