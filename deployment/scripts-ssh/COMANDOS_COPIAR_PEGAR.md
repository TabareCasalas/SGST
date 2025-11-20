# Comandos para Copiar y Pegar - Deployment SGST

Estos son los comandos listos para copiar y pegar directamente en SSH para cada servidor.

## 📋 Servidor 1: Base de Datos (PostgreSQL)

### Opción 1: Con curl (recomendado)

```bash
export DB_PASSWORD="tu_contraseña_segura" && curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/database-deploy.sh | bash
```

### Opción 2: Con wget (si curl no está disponible)

```bash
export DB_PASSWORD="tu_contraseña_segura" && wget -qO- https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/database-deploy.sh | bash
```

### Opción 3: Descargar y ejecutar manualmente

```bash
wget https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/database-deploy.sh
chmod +x database-deploy.sh
export DB_PASSWORD="tu_contraseña_segura"
sudo bash database-deploy.sh
```

### Después del deployment:

```bash
# Configurar pg_hba.conf con las IPs del backend y camunda
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Agregar estas líneas (reemplaza con las IPs reales):
# host    all             all             <IP_BACKEND>/32         md5
# host    all             all             <IP_CAMUNDA>/32         md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Verificar
sudo systemctl status postgresql
```

---

## 📋 Servidor 2: Backend (Node.js API)

### Configurar variables primero:

```bash
export DB_HOST="<IP_SERVIDOR_DB>"
export DB_PORT="5432"
export DB_NAME="sgst_db"
export DB_USER="sgst_user"
export DB_PASSWORD="tu_contraseña"
export ORCHESTRATOR_URL="http://<IP_SERVIDOR_CAMUNDA>:3002"
export ORCHESTRATOR_TOKEN="tu_token_seguro"
export JWT_SECRET="$(openssl rand -base64 32)"
export REFRESH_SECRET="$(openssl rand -base64 32)"
```

### Comando completo (copiar todo):

```bash
curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/backend-deploy.sh | bash
```

### Alternativa con wget:

```bash
wget -qO- https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/backend-deploy.sh | bash
```

### Verificar después del deployment:

```bash
# Ver estado
sudo systemctl status sgst-backend

# Ver logs
sudo journalctl -u sgst-backend -f

# Probar endpoint
curl http://localhost:3001/health
```

---

## 📋 Servidor 3: Frontend (React + Nginx)

### Configurar variable primero:

```bash
export BACKEND_URL="http://<IP_SERVIDOR_BACKEND>:3001"
```

### Comando completo (copiar todo):

```bash
curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/frontend-deploy.sh | bash
```

### Alternativa con wget:

```bash
wget -qO- https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/frontend-deploy.sh | bash
```

### Verificar después del deployment:

```bash
# Ver estado
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log

# Probar
curl http://localhost
```

---

## 📋 Servidor 4: Camunda

### Configurar variables primero:

```bash
export DB_HOST="<IP_SERVIDOR_DB>"
export DB_PORT="5432"
export DB_NAME="camunda_db"
export DB_USER="sgst_user"
export DB_PASSWORD="tu_contraseña"
export BACKEND_URL="http://<IP_SERVIDOR_BACKEND>:3001"
export ORCHESTRATOR_TOKEN="tu_token_seguro"
```

### Comando completo (copiar todo):

```bash
curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/camunda-deploy.sh | bash
```

### Alternativa con wget:

```bash
wget -qO- https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/camunda-deploy.sh | bash
```

### Verificar después del deployment:

```bash
# Ver estado de contenedores
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml ps

# Ver logs
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml logs -f

# Probar endpoints
curl http://localhost:8081/actuator/health
curl http://localhost:3002/health
```

---

## 🔄 Actualizar Código (Re-deployment)

### Backend:

```bash
export DB_HOST="<IP_SERVIDOR_DB>"
export DB_PASSWORD="tu_contraseña"
export JWT_SECRET="tu_jwt_secret"
export REFRESH_SECRET="tu_refresh_secret"
export ORCHESTRATOR_URL="http://<IP_SERVIDOR_CAMUNDA>:3002"
export ORCHESTRATOR_TOKEN="tu_token"
curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/backend-deploy.sh | bash
```

### Frontend:

```bash
export BACKEND_URL="http://<IP_SERVIDOR_BACKEND>:3001"
curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/frontend-deploy.sh | bash
```

### Camunda (solo orchestrator):

```bash
# Conectarse al servidor
ssh usuario@<IP_SERVIDOR_CAMUNDA>

# Actualizar orchestrator
cd /tmp
git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst
sudo cp -r sgst/orchestrator/* /opt/sgst-camunda/orchestrator/
sudo chown -R sgst:sgst /opt/sgst-camunda/orchestrator/
cd /opt/sgst-camunda
sudo -u sgst docker-compose restart orchestrator
rm -rf /tmp/sgst
```

---

## 📝 Notas Importantes

1. **Orden de deployment**: Base de datos → Camunda → Backend → Frontend

2. **Generar secrets seguros**:
   ```bash
   openssl rand -base64 32  # Para JWT_SECRET
   openssl rand -base64 32  # Para REFRESH_SECRET
   openssl rand -base64 32  # Para ORCHESTRATOR_TOKEN
   ```

3. **Firewall de Google Cloud**: Configura las reglas de firewall antes de iniciar los servicios

4. **Primera vez**: Los scripts instalan todo desde cero. Para actualizaciones, puedes ejecutar los mismos comandos.

5. **Verificar conectividad**: Asegúrate de que los servidores puedan comunicarse entre sí antes de iniciar.

---

## 🚨 Troubleshooting Rápido

### Si un script falla:

1. Verifica que todas las variables estén configuradas
2. Verifica conectividad a internet (para clonar el repo)
3. Verifica que no haya procesos corriendo en los puertos
4. Revisa los logs del servicio correspondiente

### Ver logs:

```bash
# Base de datos
sudo journalctl -u postgresql -f

# Backend
sudo journalctl -u sgst-backend -f

# Frontend
sudo tail -f /var/log/nginx/error.log

# Camunda
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml logs -f
```

