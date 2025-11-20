# Comandos Directos - Deployment SGST

**✨ Versión que clona desde GitHub**: Estos comandos clonan el repositorio completo y ejecutan la instalación.

---

## 📋 Servidor 1: Base de Datos (PostgreSQL)
**IP: 35.198.27.56**

```bash
cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && chmod +x deployment/scripts-ssh/database-deploy.sh && bash deployment/scripts-ssh/database-deploy.sh
```

O si prefieres ejecutar directamente sin clonar primero:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/database-deploy.sh)" || (cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && bash deployment/scripts-ssh/database-deploy.sh)
```

---

## 📋 Servidor 2: Backend (Node.js API)
**IP: 35.199.81.198**

```bash
cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && chmod +x deployment/scripts-ssh/backend-deploy.sh && bash deployment/scripts-ssh/backend-deploy.sh
```

---

## 📋 Servidor 3: Frontend (React + Nginx)
**IP: 34.39.214.142**

```bash
cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && chmod +x deployment/scripts-ssh/frontend-deploy.sh && bash deployment/scripts-ssh/frontend-deploy.sh
```

---

## 📋 Servidor 4: Camunda
**IP: 35.198.59.98**

```bash
cd /tmp && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && chmod +x deployment/scripts-ssh/camunda-deploy.sh && bash deployment/scripts-ssh/camunda-deploy.sh
```

---

## 🔄 Alternativa: Comando con fallback

Si el raw.githubusercontent.com no funciona, usa este comando que intenta primero con curl y si falla, clona el repo:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/TabareCasalas/SGST/taba-branch/deployment/scripts-ssh/database-deploy.sh 2>/dev/null)" || (cd /tmp && rm -rf sgst && git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst && cd sgst && bash deployment/scripts-ssh/database-deploy.sh)
```

