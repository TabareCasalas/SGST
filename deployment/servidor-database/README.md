# Deployment - Servidor de Base de Datos (PostgreSQL)

Este documento explica cómo desplegar PostgreSQL en el servidor de base de datos.

## Requisitos

- Ubuntu 22.04 LTS
- Acceso root o sudo
- Mínimo 2GB RAM
- 20GB espacio en disco

## Instalación

### Paso 1: Subir archivos al servidor

```bash
# Desde tu máquina local
scp -r deployment/servidor-database/* usuario@<IP_SERVIDOR_DB>:/tmp/sgst-db/
```

### Paso 2: Ejecutar script de instalación

```bash
# Conectarse al servidor
ssh usuario@<IP_SERVIDOR_DB>

# Ir al directorio
cd /tmp/sgst-db

# Dar permisos de ejecución
chmod +x install.sh

# Ejecutar instalación
sudo bash install.sh
```

### Paso 3: Configurar acceso remoto

Edita el archivo `/etc/postgresql/15/main/pg_hba.conf`:

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Agrega estas líneas (reemplaza con las IPs reales):

```
# Conexiones desde Backend SGST
host    all             all             <IP_BACKEND>/32         md5

# Conexiones desde Camunda
host    all             all             <IP_CAMUNDA>/32         md5
```

Reinicia PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### Paso 4: Configurar Firewall

En Google Cloud Console:

1. Ve a **VPC network** > **Firewall rules**
2. Crea una regla nueva:
   - **Name**: `allow-postgres-from-backend`
   - **Direction**: Ingress
   - **Targets**: All instances in the network
   - **Source IP ranges**: `<IP_BACKEND>/32,<IP_CAMUNDA>/32`
   - **Protocols and ports**: TCP 5432
   - **Action**: Allow

### Paso 5: Cambiar contraseña por defecto

```bash
sudo -u postgres psql
```

```sql
ALTER USER sgst_user WITH PASSWORD 'tu_contraseña_segura';
\q
```

Actualiza la variable de entorno en el servidor backend.

## Verificación

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Probar conexión local
sudo -u postgres psql -d sgst_db -c "SELECT 1;"

# Probar conexión remota (desde servidor backend)
psql -h <IP_DB> -U sgst_user -d sgst_db -c "SELECT 1;"
```

## Backup

### Backup manual

```bash
# Backup de sgst_db
sudo -u postgres pg_dump sgst_db > /backup/sgst_db_$(date +%Y%m%d_%H%M%S).sql

# Backup de camunda_db
sudo -u postgres pg_dump camunda_db > /backup/camunda_db_$(date +%Y%m%d_%H%M%S).sql
```

### Backup automático (cron)

Crea el script `/usr/local/bin/backup-postgres.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup sgst_db
sudo -u postgres pg_dump sgst_db | gzip > $BACKUP_DIR/sgst_db_$DATE.sql.gz

# Backup camunda_db
sudo -u postgres pg_dump camunda_db | gzip > $BACKUP_DIR/camunda_db_$DATE.sql.gz

# Eliminar backups más antiguos de 7 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

Agrega a crontab:

```bash
sudo crontab -e
# Agregar línea:
0 2 * * * /usr/local/bin/backup-postgres.sh
```

## Monitoreo

```bash
# Ver conexiones activas
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Ver tamaño de bases de datos
sudo -u postgres psql -c "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database;"
```

## Troubleshooting

### PostgreSQL no inicia

```bash
# Ver logs
sudo journalctl -u postgresql -n 50

# Verificar permisos
sudo chown -R postgres:postgres /var/lib/postgresql
```

### No se puede conectar remotamente

1. Verificar que `listen_addresses = '*'` en `postgresql.conf`
2. Verificar reglas de firewall en Google Cloud
3. Verificar `pg_hba.conf` tiene la IP correcta

