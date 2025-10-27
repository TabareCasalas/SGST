# 🐳 Guía de Configuración con Docker

Este documento describe cómo levantar todo el proyecto SGST con un solo comando usando Docker Compose.

## 📋 Prerequisitos

- Docker Desktop instalado y ejecutándose
- Docker Compose v3.8 o superior
- PowerShell o Terminal con acceso a Docker

## 🚀 Inicio Rápido

### 1. Crear archivo de variables de entorno (opcional)

Si quieres personalizar la configuración, crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar con tus valores personalizados (opcional)
notepad .env
```

### 2. Levantar todos los servicios

Desde la raíz del proyecto, ejecuta:

```bash
docker-compose up -d --build
```

Este comando:
- Construye las imágenes necesarias (backend, frontend, orchestrator)
- Descarga las imágenes de Postgres, Camunda, PgAdmin
- Inicia todos los contenedores en segundo plano
- Configura las redes y volúmenes necesarios

### 3. Verificar que todo funciona

```bash
# Ver el estado de los contenedores
docker-compose ps

# Ver los logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
```

### 4. Acceder a los servicios

Una vez levantado, podrás acceder a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interfaz web de SGST |
| **Backend API** | http://localhost:3001 | API REST del backend |
| **Orchestrator** | http://localhost:3002 | Servicio orquestador |
| **Camunda** | http://localhost:8081 | Consola de Camunda BPM |
| **Camunda REST API** | http://localhost:8081/engine-rest | API REST de Camunda |
| **PgAdmin** | http://localhost:8080 | Administrador de PostgreSQL |
| **PostgreSQL** | localhost:5432 | Base de datos |

### 5. Detener los servicios

```bash
# Detener sin eliminar contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes (¡CUIDADO! Esto borra la BD)
docker-compose down -v
```

## 🔧 Comandos Útiles

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
docker-compose logs -f orchestrator
```

### Reconstruir un servicio específico

```bash
# Reconstruir solo el backend
docker-compose up -d --build backend

# Reconstruir todo
docker-compose up -d --build
```

### Ejecutar comandos dentro de un contenedor

```bash
# Conectarse al backend
docker exec -it sgst_backend sh

# Ejecutar Prisma migrations
docker exec -it sgst_backend npm run prisma:migrate

# Conectarse a la base de datos
docker exec -it sgst_postgres psql -U sgst_user -d sgst_db
```

### Ver el estado de los servicios

```bash
# Estado básico
docker-compose ps

# Estado con más detalles
docker-compose ps -a

# Recursos utilizados
docker stats
```

## 🗂️ Estructura de Contenedores

```
┌─────────────────────────────────────────────────────────┐
│                    sgst_network                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  frontend   │→ │   backend   │→ │  postgres   │    │
│  │   (React)   │  │   (Node)    │  │   (5432)    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                               ↑                        │
│  ┌─────────────┐  ┌─────────────┐      │              │
│  │ camunda    │← │orchestrator │──────┘              │
│  │  (8081)    │  │   (3002)    │                      │
│  └─────────────┘  └─────────────┘                      │
│                                                         │
│  ┌─────────────┐                                       │
│  │  pgadmin   │                                       │
│  │   (8080)   │                                       │
│  └─────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

## 📊 Volúmenes Persistidos

Los siguientes volúmenes se crean automáticamente:

- `postgres_data`: Datos de PostgreSQL (tablas, índices, etc.)
- `pgadmin_data`: Configuración de PgAdmin
- `camunda_data`: Datos de Camunda (instancias de proceso)

## 🐛 Solución de Problemas

### Los contenedores no inician

```bash
# Ver los logs
docker-compose logs

# Verificar la configuración
docker-compose config
```

### Error al conectar a la base de datos

```bash
# Reiniciar el servicio de PostgreSQL
docker-compose restart postgres

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### Limpiar todo y empezar de nuevo

```bash
# ⚠️ ATENCIÓN: Esto elimina todos los datos
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### El frontend no carga

```bash
# Verificar que el build se completó correctamente
docker-compose logs frontend

# Reconstruir el frontend
docker-compose up -d --build frontend
```

## 🔐 Credenciales por Defecto

### PostgreSQL
- **Usuario**: sgst_user
- **Contraseña**: sgst_password
- **Database**: sgst_db

### PgAdmin
- **Email**: admin@sgst.com
- **Contraseña**: admin123

> ⚠️ **IMPORTANTE**: Estas son credenciales por defecto. **Cámbialas en producción**.

## 📝 Próximos Pasos

1. Ejecuta las migraciones de Prisma
2. Despliega los diagramas BPMN en Camunda
3. Configura las variables de entorno según tu entorno
4. Revisa los logs para verificar que todo funciona correctamente

## 🆘 Ayuda Adicional

Para más información sobre:
- Backend: Ver `backend/README.md`
- Orchestrator: Ver `orchestrator/README.md`
- Arquitectura: Ver `ARQUITECTURA_CAMUNDA.md`
- Implementación: Ver `IMPLEMENTACION_FLUJO.md`

