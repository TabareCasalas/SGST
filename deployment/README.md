# Guía de Deployment - SGST en Google Cloud

Esta guía explica cómo desplegar la aplicación SGST en 4 servidores separados de Google Cloud con Ubuntu.

## Arquitectura de Deployment

```
┌─────────────────┐
│  Servidor 1     │
│   Frontend      │
│   (Nginx)       │
│   Puerto: 80    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Servidor 2     │
│   Backend       │
│   (Node.js)     │
│   Puerto: 3001  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Servidor 3     │
│   PostgreSQL    │
│   Puerto: 5432  │
└─────────────────┘

┌─────────────────┐
│  Servidor 4     │
│   Camunda       │
│   (Zeebe +      │
│    Operate +    │
│    Tasklist)    │
│   Puertos:      │
│   26500, 8081   │
└─────────────────┘
```

## Requisitos Previos

1. **4 Instancias de VM en Google Cloud con Ubuntu 22.04 LTS**
2. **Acceso SSH a cada servidor**
3. **Dominio configurado (opcional pero recomendado)**
4. **Firewall configurado en Google Cloud para permitir:**
   - Puerto 80 (HTTP) y 443 (HTTPS) en servidor Frontend
   - Puerto 3001 en servidor Backend
   - Puerto 5432 en servidor PostgreSQL (solo desde Backend)
   - Puertos 26500, 8081, 8082, 8083 en servidor Camunda

## Pasos de Deployment

### 1. Preparación de Servidores

Ejecuta en cada servidor:

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar herramientas básicas
sudo apt install -y curl wget git build-essential
```

### 2. Deployment por Servidor

Sigue las instrucciones específicas para cada servidor:

1. [Servidor de Base de Datos (PostgreSQL)](./servidor-database/README.md)
2. [Servidor de Backend](./servidor-backend/README.md)
3. [Servidor de Frontend](./servidor-frontend/README.md)
4. [Servidor de Camunda](./servidor-camunda/README.md)

## Orden de Deployment

**IMPORTANTE**: Sigue este orden para evitar errores de conexión:

1. **Primero**: Servidor de Base de Datos (PostgreSQL)
2. **Segundo**: Servidor de Camunda
3. **Tercero**: Servidor de Backend
4. **Cuarto**: Servidor de Frontend

## Variables de Entorno

Cada servidor necesita sus propias variables de entorno. Consulta los archivos `.env.example` en cada directorio de servidor.

## Verificación Post-Deployment

Después de desplegar todos los servidores, verifica:

1. **Base de Datos**: `psql -h <IP_DB> -U sgst_user -d sgst_db -c "SELECT 1;"`
2. **Backend**: `curl http://<IP_BACKEND>:3001/health`
3. **Camunda**: `curl http://<IP_CAMUNDA>:8081/actuator/health`
4. **Frontend**: Abre `http://<IP_FRONTEND>` en navegador

## Troubleshooting

Consulta el archivo [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para soluciones a problemas comunes.

## Seguridad

- Cambia todas las contraseñas por defecto
- Configura SSL/TLS para el frontend
- Restringe acceso a la base de datos solo desde el backend
- Usa firewall de Google Cloud para limitar acceso

## Backup

Configura backups automáticos para:
- Base de datos PostgreSQL
- Archivos subidos (backend/uploads)
- Configuraciones de Camunda

