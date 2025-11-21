# 🚀 Deployment Automatizado - SGST

Script de deployment automatizado para desplegar toda la aplicación SGST en un servidor de Google Cloud.

## 📋 Resumen

Este deployment automatiza la instalación y configuración completa de:
- ✅ Docker y Docker Compose
- ✅ PostgreSQL
- ✅ Backend (Node.js/Express)
- ✅ Frontend (React/Vite)
- ✅ Orchestrator
- ✅ Camunda 8 (Zeebe, Operate, Tasklist, Identity)
- ✅ Elasticsearch
- ✅ PgAdmin

## 🎯 Comandos Iniciales (Ejecutar estos)

### Desde Windows (PowerShell):

```powershell
cd C:\Users\taba\Desktop\Proyectos\SGST
.\deploy.ps1 tu_usuario 35.199.81.198
```

### Desde Git Bash o WSL:

```bash
cd /c/Users/taba/Desktop/Proyectos/SGST
chmod +x deploy.sh
./deploy.sh tu_usuario 35.199.81.198
```

### Desde el servidor directamente:

```bash
ssh tu_usuario@35.199.81.198
cd /opt
sudo git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst
cd sgst
chmod +x deploy.sh
./deploy.sh
```

## 📁 Archivos Creados

1. **`deploy.sh`** - Script principal de deployment (Linux/Mac/Git Bash)
2. **`deploy.ps1`** - Script wrapper para Windows PowerShell
3. **`Dockerfile`** - Dockerfile para el frontend (multi-stage build)
4. **`DEPLOYMENT.md`** - Documentación completa del deployment
5. **`COMANDOS_INICIALES.md`** - Guía rápida de comandos
6. **`README_DEPLOY.md`** - Este archivo (resumen)

## ⚙️ Configuración Automática

El script configura automáticamente:

- ✅ Variables de entorno (`.env`)
- ✅ Secrets aleatorios para JWT y tokens
- ✅ URLs con la IP del servidor
- ✅ Firewall (puertos necesarios)
- ✅ Todos los servicios Docker

## 🌐 URLs de Acceso

Después del deployment, la aplicación estará disponible en:

- **Frontend**: http://35.199.81.198
- **Backend API**: http://35.199.81.198:3001
- **Camunda Operate**: http://35.199.81.198:8081
- **Camunda Tasklist**: http://35.199.81.198:8082
- **Camunda Identity**: http://35.199.81.198:8083
- **PgAdmin**: http://35.199.81.198:8080

## 🔧 Comandos Útiles Post-Deployment

### Ver logs
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose logs -f'
```

### Ver estado
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose ps'
```

### Reiniciar servicios
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose restart'
```

### Detener todo
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose down'
```

## ⏱️ Tiempo Estimado

- **Primera vez**: 15-30 minutos
- **Actualizaciones**: 5-10 minutos

## 📚 Documentación Adicional

- Ver `DEPLOYMENT.md` para documentación completa
- Ver `COMANDOS_INICIALES.md` para comandos rápidos
- Ver `docker-compose.yml` para configuración de servicios

## ⚠️ Notas Importantes

1. **Primera ejecución**: El script puede tardar varios minutos en instalar Docker y descargar imágenes
2. **Secrets**: Los secrets se generan automáticamente - guárdalos de forma segura
3. **Contraseñas**: Revisa y cambia las contraseñas por defecto en `.env`
4. **Recursos**: El servidor e2-mini tiene recursos limitados - monitorea el uso

## 🆘 Solución de Problemas

Si encuentras problemas:

1. Ver logs: `docker compose logs`
2. Ver estado: `docker compose ps`
3. Verificar recursos: `docker stats`
4. Revisar configuración: `cat /opt/sgst/.env`

Para más detalles, consulta `DEPLOYMENT.md`.

