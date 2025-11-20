# Comandos para Copiar y Pegar - Deployment SGST

**⚠️ IMPORTANTE**: Estos comandos están configurados con las IPs y credenciales específicas. Solo copia y pega cada comando en su servidor correspondiente.

---

## 📋 Servidor 1: Base de Datos (PostgreSQL)
**IP: 35.199.81.198**

### Comando completo (copiar y pegar todo):

```bash
export DB_PASSWORD="sgst_password" && curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/database-deploy.sh | bash
```

### Después del deployment, configurar acceso remoto:

```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

Agregar estas líneas al final del archivo:

```
# Conexiones desde Backend SGST
host    all             all             35.199.81.198/32         md5

# Conexiones desde Camunda
host    all             all             35.198.59.98/32         md5
```

Luego reiniciar:

```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

---

## 📋 Servidor 2: Backend (Node.js API)
**IP: 35.199.81.198**

### Comando completo (copiar y pegar todo):

```bash
export DB_HOST="35.199.81.198" && export DB_PORT="5432" && export DB_NAME="sgst_db" && export DB_USER="sgst_user" && export DB_PASSWORD="sgst_password" && export ORCHESTRATOR_URL="http://35.198.59.98:3002" && export ORCHESTRATOR_TOKEN="aB3xK9mP2vQ7wR5tY8uI1oE4nM6cL0dF9gH2jK5sA8bC1eD4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4" && export JWT_SECRET="xY9zA2bC5dE8fG1hI4jK7lM0nO3pQ6rS9tU2vW5xY8zA1bC4dE7fG0hI3jK6lM9nO2pQ5rS8tU1vW4xY7zA0" && export REFRESH_SECRET="mN6pQ9rS2tU5vW8xY1zA4bC7dE0fG3hI6jK9lM2nO5pQ8rS1tU4vW7xY0zA3bC6dE9fG2hI5jK8lM1nO4pQ7rS0tU3vW6xY9zA2" && curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/backend-deploy.sh | bash
```

### Verificar después del deployment:

```bash
sudo systemctl status sgst-backend
sudo journalctl -u sgst-backend -f
curl http://localhost:3001/health
```

---

## 📋 Servidor 3: Frontend (React + Nginx)
**IP: 34.39.214.142**

### Comando completo (copiar y pegar todo):

```bash
export BACKEND_URL="http://35.199.81.198:3001" && curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/frontend-deploy.sh | bash
```

### Verificar después del deployment:

```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
curl http://localhost
```

---

## 📋 Servidor 4: Camunda
**IP: 35.198.59.98**

### Comando completo (copiar y pegar todo):

```bash
export DB_HOST="35.199.81.198" && export DB_PORT="5432" && export DB_NAME="camunda_db" && export DB_USER="sgst_user" && export DB_PASSWORD="sgst_password" && export BACKEND_URL="http://35.199.81.198:3001" && export ORCHESTRATOR_TOKEN="aB3xK9mP2vQ7wR5tY8uI1oE4nM6cL0dF9gH2jK5sA8bC1eD4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4" && curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/camunda-deploy.sh | bash
```

### Verificar después del deployment:

```bash
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml ps
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml logs -f
curl http://localhost:8081/actuator/health
curl http://localhost:3002/health
```

---

## 🔄 Actualizar Código (Re-deployment)

### Backend:

```bash
export DB_HOST="35.199.81.198" && export DB_PORT="5432" && export DB_NAME="sgst_db" && export DB_USER="sgst_user" && export DB_PASSWORD="sgst_password" && export ORCHESTRATOR_URL="http://35.198.59.98:3002" && export ORCHESTRATOR_TOKEN="aB3xK9mP2vQ7wR5tY8uI1oE4nM6cL0dF9gH2jK5sA8bC1eD4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4" && export JWT_SECRET="xY9zA2bC5dE8fG1hI4jK7lM0nO3pQ6rS9tU2vW5xY8zA1bC4dE7fG0hI3jK6lM9nO2pQ5rS8tU1vW4xY7zA0" && export REFRESH_SECRET="mN6pQ9rS2tU5vW8xY1zA4bC7dE0fG3hI6jK9lM2nO5pQ8rS1tU4vW7xY0zA3bC6dE9fG2hI5jK8lM1nO4pQ7rS0tU3vW6xY9zA2" && curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/backend-deploy.sh | bash
```

### Frontend:

```bash
export BACKEND_URL="http://35.199.81.198:3001" && curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/frontend-deploy.sh | bash
```

### Camunda (solo orchestrator):

```bash
cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && sudo cp -r sgst/orchestrator/* /opt/sgst-camunda/orchestrator/ && sudo chown -R sgst:sgst /opt/sgst-camunda/orchestrator/ && cd /opt/sgst-camunda && sudo -u sgst docker-compose restart orchestrator && rm -rf /tmp/sgst
```

---

## 📝 Orden de Deployment

**IMPORTANTE**: Ejecuta los comandos en este orden:

1. ✅ **Base de Datos** (35.199.81.198) - Primero
2. ✅ **Camunda** (35.198.59.98) - Segundo
3. ✅ **Backend** (35.199.81.198) - Tercero
4. ✅ **Frontend** (34.39.214.142) - Cuarto

---

## 🔍 Verificación Final

Después de desplegar todos los servidores, verifica:

```bash
# Base de datos
ssh usuario@35.199.81.198 "sudo systemctl status postgresql"

# Backend
curl http://35.199.81.198:3001/health

# Frontend
curl http://34.39.214.142

# Camunda
curl http://35.198.59.98:8081/actuator/health
curl http://35.198.59.98:3002/health
```

---

## 🚨 Troubleshooting Rápido

### Si un comando falla:

1. Verifica conectividad a internet (para clonar desde GitHub)
2. Verifica que no haya procesos en los puertos
3. Revisa los logs del servicio correspondiente

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

---

## 🔐 Secrets Generados

Los siguientes secrets han sido generados y están incluidos en los comandos:

- **JWT_SECRET**: `xY9zA2bC5dE8fG1hI4jK7lM0nO3pQ6rS9tU2vW5xY8zA1bC4dE7fG0hI3jK6lM9nO2pQ5rS8tU1vW4xY7zA0`
- **REFRESH_SECRET**: `mN6pQ9rS2tU5vW8xY1zA4bC7dE0fG3hI6jK9lM2nO5pQ8rS1tU4vW7xY0zA3bC6dE9fG2hI5jK8lM1nO4pQ7rS0tU3vW6xY9zA2`
- **ORCHESTRATOR_TOKEN**: `aB3xK9mP2vQ7wR5tY8uI1oE4nM6cL0dF9gH2jK5sA8bC1eD4fG7hJ0kL3mN6pQ9rS2tU5vW8xY1zA4`

**⚠️ IMPORTANTE**: Guarda estos secrets de forma segura. Los necesitarás para futuros deployments.

