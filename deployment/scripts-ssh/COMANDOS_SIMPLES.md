# Comandos Simples - Deployment SGST

**✨ Versión simplificada**: Estos comandos funcionan directamente sin configurar variables. Solo copia y pega.

---

## 📋 Servidor 1: Base de Datos (PostgreSQL)
**IP: 35.198.27.56**

```bash
apt update && apt install -y git && cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && bash deployment/scripts-ssh/database-deploy.sh
```

**Después del deployment, configurar acceso remoto:**

```bash
echo -e "\n# Conexiones desde Backend SGST\nhost    all             all             35.199.81.198/32         md5\n\n# Conexiones desde Camunda\nhost    all             all             35.198.59.98/32         md5" | sudo tee -a /etc/postgresql/15/main/pg_hba.conf && sudo systemctl restart postgresql && sudo systemctl status postgresql
```

---

## 📋 Servidor 2: Backend (Node.js API)
**IP: 35.199.81.198**

```bash
apt update && apt install -y git && cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && bash deployment/scripts-ssh/backend-deploy.sh
```

**Verificar:**

```bash
sudo systemctl status sgst-backend && curl http://localhost:3001/health
```

---

## 📋 Servidor 3: Frontend (React + Nginx)
**IP: 34.39.214.142**

```bash
apt update && apt install -y git && cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && bash deployment/scripts-ssh/frontend-deploy.sh
```

**Verificar:**

```bash
sudo systemctl status nginx && curl http://localhost
```

---

## 📋 Servidor 4: Camunda
**IP: 35.198.59.98**

```bash
apt update && apt install -y git && cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && bash deployment/scripts-ssh/camunda-deploy.sh
```

**Verificar:**

```bash
sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml ps && curl http://localhost:8081/actuator/health && curl http://localhost:3002/health
```

---

## 🔄 Actualizar Código

### Backend:
```bash
cd /tmp && rm -rf sgst && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && bash deployment/scripts-ssh/backend-deploy.sh
```

### Frontend:
```bash
cd /tmp && rm -rf sgst && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && bash deployment/scripts-ssh/frontend-deploy.sh
```

### Camunda (solo orchestrator):
```bash
cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && sudo cp -r sgst/orchestrator/* /opt/sgst-camunda/orchestrator/ && sudo chown -R sgst:sgst /opt/sgst-camunda/orchestrator/ && cd /opt/sgst-camunda && sudo -u sgst docker-compose restart orchestrator && rm -rf /tmp/sgst
```

---

## 📝 Orden de Ejecución

1. ✅ Base de Datos (35.198.27.56)
2. ✅ Camunda (35.198.59.98)
3. ✅ Backend (35.199.81.198)
4. ✅ Frontend (34.39.214.142)

---

## 🔍 Verificación Final

```bash
# Backend
curl http://35.199.81.198:3001/health

# Frontend
curl http://34.39.214.142

# Camunda
curl http://35.198.59.98:8081/actuator/health
curl http://35.198.59.98:3002/health
```

