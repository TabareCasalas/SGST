# Deployment - Servidor de Camunda

Este documento explica cómo desplegar Camunda 8 en el servidor.

## Requisitos

- Ubuntu 22.04 LTS
- Acceso root o sudo
- Mínimo 4GB RAM (8GB recomendado)
- 30GB espacio en disco
- Docker y Docker Compose instalados
- Acceso al servidor de base de datos

## Instalación Inicial

### Paso 1: Preparar servidor

```bash
# Conectarse al servidor
ssh usuario@<IP_SERVIDOR_CAMUNDA>

# Subir archivos de instalación
scp -r deployment/servidor-camunda/* usuario@<IP_SERVIDOR_CAMUNDA>:/tmp/sgst-camunda/
```

### Paso 2: Configurar variables de entorno

Antes de ejecutar el script de instalación:

```bash
export DB_HOST="<IP_SERVIDOR_DB>"
export DB_PORT="5432"
export DB_NAME="camunda_db"
export DB_USER="sgst_user"
export DB_PASSWORD="tu_contraseña_segura"
export BACKEND_URL="http://<IP_SERVIDOR_BACKEND>:3001"
export ORCHESTRATOR_TOKEN="tu_token_seguro"
```

### Paso 3: Copiar código del orchestrator

```bash
# Desde tu máquina local
scp -r orchestrator/* usuario@<IP_SERVIDOR_CAMUNDA>:/tmp/sgst-camunda/orchestrator/
```

### Paso 4: Copiar diagramas BPMN

```bash
# Desde tu máquina local
scp -r camunda/diagrams/* usuario@<IP_SERVIDOR_CAMUNDA>:/tmp/sgst-camunda/diagrams/
```

### Paso 5: Ejecutar instalación

```bash
# En el servidor
cd /tmp/sgst-camunda
chmod +x install.sh
sudo bash install.sh
```

### Paso 6: Verificar instalación

```bash
# Ver estado de contenedores
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml ps

# Ver logs
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml logs -f

# Probar endpoints
curl http://localhost:8081/actuator/health
curl http://localhost:3002/health
```

## Configuración de Firewall

En Google Cloud Console:

1. Ve a **VPC network** > **Firewall rules**
2. Crea reglas para:
   - **Zeebe**: TCP 26500, 26501
   - **Operate**: TCP 8081
   - **Tasklist**: TCP 8082
   - **Identity**: TCP 8083
   - **Orchestrator**: TCP 3002

## Despliegue de Diagramas BPMN

### Opción 1: Manual

```bash
# Copiar diagramas
scp camunda/diagrams/*.bpmn sgst@<IP_SERVIDOR_CAMUNDA>:/opt/sgst-camunda/diagrams/

# Reiniciar Zeebe para cargar diagramas
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml restart zeebe
```

### Opción 2: Usando script de deployment

```bash
# Desde tu máquina local
node scripts/deploy-bpmn.js
```

## Actualización del Orchestrator

```bash
# 1. Conectarse al servidor
ssh sgst@<IP_SERVIDOR_CAMUNDA>

# 2. Detener orchestrator
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml stop orchestrator

# 3. Subir nuevo código (desde tu máquina local)
scp -r orchestrator/* sgst@<IP_SERVIDOR_CAMUNDA>:/opt/sgst-camunda/orchestrator/

# 4. Reiniciar orchestrator
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml up -d orchestrator
```

## Monitoreo

### Ver logs

```bash
# Todos los servicios
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml logs -f

# Servicio específico
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml logs -f zeebe
```

### Ver estado

```bash
# Estado de contenedores
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml ps

# Uso de recursos
sudo docker stats
```

## Acceso a Interfaces Web

- **Operate**: http://<IP_SERVIDOR_CAMUNDA>:8081
- **Tasklist**: http://<IP_SERVIDOR_CAMUNDA>:8082
- **Identity**: http://<IP_SERVIDOR_CAMUNDA>:8083

## Troubleshooting

### Contenedores no inician

```bash
# Ver logs de error
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml logs

# Verificar recursos
free -h
df -h
```

### Error de conexión a base de datos

1. Verificar que PostgreSQL esté accesible desde Camunda
2. Verificar credenciales en `.env`
3. Probar conexión: `psql -h <IP_DB> -U sgst_user -d camunda_db`

### Zeebe no procesa procesos

1. Verificar que los diagramas BPMN estén en `/opt/sgst-camunda/diagrams/`
2. Verificar logs de Zeebe: `sudo -u sgst docker-compose logs zeebe`
3. Verificar conexión a Elasticsearch

### Orchestrator no se conecta a Zeebe

1. Verificar que Zeebe esté corriendo: `docker ps | grep zeebe`
2. Verificar variable `ZEEBE_ADDRESS` en docker-compose.yml
3. Ver logs del orchestrator

## Backup

### Backup de datos de Zeebe

```bash
sudo tar -czf /backup/zeebe_$(date +%Y%m%d).tar.gz -C /opt/sgst-camunda/data/zeebe .
```

### Backup de Elasticsearch

```bash
sudo tar -czf /backup/elasticsearch_$(date +%Y%m%d).tar.gz -C /opt/sgst-camunda/data/elasticsearch .
```

### Backup completo

```bash
sudo tar -czf /backup/camunda_$(date +%Y%m%d).tar.gz -C /opt/sgst-camunda .
```

## Optimización

### Aumentar memoria de Elasticsearch

Edita `docker-compose.yml` y cambia:
```yaml
- "ES_JAVA_OPTS=-Xms1g -Xmx1g"
```

### Configurar límites de recursos

Agrega a cada servicio en `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '1'
      memory: 1G
```

