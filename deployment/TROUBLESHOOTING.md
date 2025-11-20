# Troubleshooting - Deployment SGST

Este documento contiene soluciones a problemas comunes durante el deployment.

## Problemas Comunes

### 1. Error de conexión a base de datos

**Síntomas:**
- Backend no puede conectarse a PostgreSQL
- Camunda no puede conectarse a PostgreSQL

**Soluciones:**

1. Verificar que PostgreSQL esté corriendo:
```bash
# En servidor de base de datos
sudo systemctl status postgresql
```

2. Verificar que PostgreSQL acepte conexiones remotas:
```bash
# Verificar postgresql.conf
sudo grep listen_addresses /etc/postgresql/15/main/postgresql.conf
# Debe mostrar: listen_addresses = '*'
```

3. Verificar pg_hba.conf:
```bash
# Verificar que tenga la IP del backend/camunda
sudo cat /etc/postgresql/15/main/pg_hba.conf | grep -E "backend|camunda"
```

4. Verificar firewall de Google Cloud:
- Puerto 5432 debe estar abierto para las IPs del backend y camunda

5. Probar conexión manual:
```bash
# Desde servidor backend
psql -h <IP_DB> -U sgst_user -d sgst_db
```

### 2. Backend no inicia

**Síntomas:**
- `systemctl status sgst-backend` muestra error
- No responde en puerto 3001

**Soluciones:**

1. Ver logs:
```bash
sudo journalctl -u sgst-backend -n 50
```

2. Verificar variables de entorno:
```bash
sudo cat /opt/sgst-backend/.env
```

3. Verificar que Node.js esté instalado:
```bash
node --version
npm --version
```

4. Verificar permisos:
```bash
sudo chown -R sgst:sgst /opt/sgst-backend
```

5. Verificar que la compilación se haya completado:
```bash
ls -la /opt/sgst-backend/dist/
```

6. Probar ejecución manual:
```bash
cd /opt/sgst-backend
sudo -u sgst node dist/index.js
```

### 3. Frontend muestra error 502

**Síntomas:**
- Nginx responde pero muestra 502 Bad Gateway
- La aplicación no carga

**Soluciones:**

1. Verificar que el backend esté corriendo:
```bash
curl http://<IP_BACKEND>:3001/health
```

2. Verificar configuración de Nginx:
```bash
sudo nginx -t
```

3. Verificar URL del backend en .env.production:
```bash
cat /opt/sgst-frontend/.env.production
```

4. Ver logs de Nginx:
```bash
sudo tail -f /var/log/nginx/error.log
```

5. Verificar que la compilación se haya completado:
```bash
ls -la /opt/sgst-frontend/dist/
```

### 4. Camunda no inicia

**Síntomas:**
- Contenedores Docker no inician
- Servicios no responden

**Soluciones:**

1. Verificar que Docker esté corriendo:
```bash
sudo systemctl status docker
```

2. Ver logs de contenedores:
```bash
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml logs
```

3. Verificar recursos del servidor:
```bash
free -h
df -h
```

4. Verificar variables de entorno:
```bash
cat /opt/sgst-camunda/.env
```

5. Reiniciar servicios:
```bash
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml down
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml up -d
```

### 5. Orchestrator no se conecta a Zeebe

**Síntomas:**
- Orchestrator no procesa jobs
- Errores de conexión en logs

**Soluciones:**

1. Verificar que Zeebe esté corriendo:
```bash
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml ps | grep zeebe
```

2. Verificar variable ZEEBE_ADDRESS:
```bash
grep ZEEBE_ADDRESS /opt/sgst-camunda/docker-compose.yml
```

3. Ver logs del orchestrator:
```bash
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml logs orchestrator
```

4. Probar conexión desde orchestrator:
```bash
sudo -u sgst docker exec -it sgst_orchestrator wget -O- http://zeebe:26500
```

### 6. Error de permisos

**Síntomas:**
- "Permission denied" en varios comandos
- Servicios no pueden escribir archivos

**Soluciones:**

1. Verificar propietario de directorios:
```bash
# Backend
sudo chown -R sgst:sgst /opt/sgst-backend

# Frontend
sudo chown -R sgst:sgst /opt/sgst-frontend

# Camunda
sudo chown -R sgst:sgst /opt/sgst-camunda
```

2. Verificar permisos de archivos:
```bash
sudo chmod 600 /opt/sgst-backend/.env
sudo chmod 600 /opt/sgst-camunda/.env
```

3. Verificar que el usuario esté en grupo docker (para Camunda):
```bash
groups sgst
sudo usermod -aG docker sgst
```

### 7. Error de compilación

**Síntomas:**
- `npm run build` falla
- Errores de TypeScript

**Soluciones:**

1. Limpiar y reinstalar:
```bash
rm -rf node_modules dist
npm install
npm run build
```

2. Verificar versión de Node.js:
```bash
node --version  # Debe ser 18.x
```

3. Verificar espacio en disco:
```bash
df -h
```

4. Ver logs detallados:
```bash
npm run build -- --verbose
```

### 8. Problemas de red entre servidores

**Síntomas:**
- Servicios no pueden comunicarse entre sí
- Timeouts en conexiones

**Soluciones:**

1. Verificar conectividad:
```bash
# Desde backend a base de datos
telnet <IP_DB> 5432

# Desde frontend a backend
curl http://<IP_BACKEND>:3001/health
```

2. Verificar firewall de Google Cloud:
- Reglas de firewall deben permitir comunicación entre servidores

3. Verificar rutas de red:
```bash
# Verificar que las IPs sean accesibles
ping <IP_DB>
ping <IP_BACKEND>
ping <IP_CAMUNDA>
```

4. Verificar configuración de red en Google Cloud:
- Todos los servidores deben estar en la misma VPC
- Reglas de firewall deben estar correctamente configuradas

## Comandos Útiles de Diagnóstico

### Verificar estado de todos los servicios

```bash
# Base de datos
sudo systemctl status postgresql

# Backend
sudo systemctl status sgst-backend

# Frontend
sudo systemctl status nginx

# Camunda
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml ps
```

### Ver logs en tiempo real

```bash
# Backend
sudo journalctl -u sgst-backend -f

# Frontend
sudo tail -f /var/log/nginx/error.log

# Camunda
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml logs -f
```

### Verificar recursos del sistema

```bash
# Memoria
free -h

# Disco
df -h

# CPU
top
```

### Reiniciar todos los servicios

```bash
# Base de datos
sudo systemctl restart postgresql

# Backend
sudo systemctl restart sgst-backend

# Frontend
sudo systemctl restart nginx

# Camunda
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml restart
```

## Contacto y Soporte

Si los problemas persisten:

1. Revisa los logs detallados de cada servicio
2. Verifica la configuración de red en Google Cloud
3. Consulta la documentación oficial de cada componente
4. Contacta al equipo de desarrollo

