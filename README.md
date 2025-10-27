# 🔐 SGST - Sistema de Gestión de Trámites Notariales

Sistema integral para la gestión de trámites en una clínica notarial, desarrollado con **React**, **Node.js**, **TypeScript**, **PostgreSQL**, y **Camunda BPM**.

---

## 📋 Tabla de Contenidos

1. [Arquitectura del Sistema](#-arquitectura-del-sistema)
2. [Estructura del Proyecto](#-estructura-del-proyecto)
3. [Inicio Rápido](#-inicio-rápido)
4. [Servicios y URLs](#-servicios-y-urls)
5. [Cómo Funciona el Sistema](#-cómo-funciona-el-sistema)
6. [Base de Datos](#-base-de-datos)
7. [Comandos Útiles](#-comandos-útiles)
7. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
8. [Solución de Problemas](#-solución-de-problemas)

---

## 🏗️ Arquitectura del Sistema

El sistema está compuesto por **6 servicios** principales:

```
┌──────────────────────────────────────────────────────────┐
│                    sgst_network                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  frontend  │→ │   backend  │→ │  postgres  │         │
│  │  (React)   │  │  (Node.js) │  │   (5432)   │         │
│  │   port 80  │  │  port 3001 │  │            │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│           ↑             ↑                                │
│  ┌────────┴─────────────┴────────────┐                   │
│  │         orchestrator             │                   │
│  │         (port 3002)               │                   │
│  └────────────────┬──────────────────┘                   │
│                   │                                      │
│           ┌────────▼──────────┐                          │
│           │     camunda      │                          │
│           │   (BPM Engine)   │                          │
│           │     port 8080    │                          │
│           └───────────────────┘                          │
│                                                           │
│  ┌────────────┐                                           │
│  │  pgadmin   │                                           │
│  │  port 8080 │                                           │
│  └────────────┘                                           │
└──────────────────────────────────────────────────────────┘
```

### Componentes

1. **Frontend** (React + TypeScript + Vite) - Interfaz web
2. **Backend** (Node.js + Express + Prisma) - API REST
3. **PostgreSQL** - Base de datos principal
4. **Camunda BPM** - Motor de procesos de negocio
5. **Orchestrator** - Coordina Camunda con Backend
6. **PgAdmin** - Administrador de PostgreSQL

---

## 📁 Estructura del Proyecto

```
SGST/
├── frontend/                  # Frontend React + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── assets/
│   │   └── types/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── backend/                   # Backend Node.js + Express
│   ├── src/
│   │   ├── controllers/       # Controladores de la API
│   │   ├── routes/           # Rutas de Express
│   │   ├── services/         # Servicios de negocio
│   │   ├── lib/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma     # Esquema de la base de datos
│   ├── Dockerfile
│   └── package.json
│
├── orchestrator/              # Servicio Orchestrator
│   ├── src/
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
│
├── camunda/
│   └── diagrams/             # Diagramas BPMN
│       └── flujo-tramite-example.bpmn
│
├── docker-compose.yml         # Orquestación de servicios
├── env.example                # Variables de entorno
└── README.md                  # Este archivo
```

---

## 🚀 Inicio Rápido

### Prerequisitos

- Docker Desktop instalado y corriendo
- PowerShell o Terminal

### Levantar el Sistema

```powershell
# 1. Levantar todos los servicios
docker-compose up -d --build

# 2. Verificar que todo funciona
docker-compose ps

# 3. Ver logs (opcional)
docker-compose logs -f
```

### Detener el Sistema

```powershell
# Detener servicios
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# ⚠️ Eliminar también volúmenes (borra los datos)
docker-compose down -v
```

---

## 🌐 Servicios y URLs

Una vez levantado, puedes acceder a:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend** | http://localhost:3000 | - |
| **Backend API** | http://localhost:3001 | - |
| **Orchestrator** | http://localhost:3002 | - |
| **Camunda** | http://localhost:8081 | admin / admin |
| **PgAdmin** | http://localhost:8080 | admin@sgst.com / admin123 |

### Health Checks

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/health
- Orchestrator: http://localhost:3002/health

---

## ⚙️ Cómo Funciona el Sistema

### Flujo Completo de un Trámite

```
1. Usuario → Frontend: Crea un trámite
2. Frontend → Backend: POST /api/tramites
3. Backend → PostgreSQL: Guarda el trámite
4. Backend → Orchestrator: POST /api/procesos/iniciar
5. Orchestrator → Camunda: Inicia proceso BPMN
6. Camunda → Orchestrator: Asigna external tasks
7. Orchestrator → Backend: Ejecuta acciones
   - actualizar-estado
   - enviar-notificacion
8. Backend → PostgreSQL: Actualiza datos
9. Frontend: Muestra estado actualizado
```

### Endpoints del Backend

#### Trámites
```
GET    /api/tramites           # Listar todos
GET    /api/tramites/:id       # Obtener uno
POST   /api/tramites           # Crear (inicia proceso en Camunda)
PATCH  /api/tramites/:id       # Actualizar
DELETE /api/tramites/:id       # Eliminar
POST   /api/tramites/notificar # Enviar notificación
GET    /api/tramites/stats     # Estadísticas
```

#### Usuarios
```
GET    /api/usuarios           # Listar todos
GET    /api/usuarios/:id       # Obtener uno
POST   /api/usuarios           # Crear
PATCH  /api/usuarios/:id       # Actualizar
```

#### Grupos
```
GET    /api/grupos             # Listar todos
GET    /api/grupos/:id         # Obtener uno
POST   /api/grupos             # Crear
PATCH  /api/grupos/:id         # Actualizar
```

#### Consultantes
```
GET    /api/consultantes      # Listar todos
GET    /api/consultantes/:id  # Obtener uno
POST   /api/consultantes      # Crear
PATCH  /api/consultantes/:id  # Actualizar
```

### External Tasks del Orchestrator

El orchestrator maneja las siguientes tareas externas de Camunda:

1. **crear-tramite**: Ejecuta lógica adicional post-creación
2. **actualizar-estado**: Actualiza el estado en el backend
3. **enviar-notificacion**: Envía notificaciones a usuarios

---

## 🗄️ Base de Datos

### Bases de Datos

El sistema utiliza dos bases de datos en PostgreSQL:

1. **sgst_db**: Base de datos de la aplicación
2. **camunda_db**: Base de datos de Camunda (creada automáticamente)

### Esquema de Datos

```prisma
Usuario
├── id_usuario (PK)
├── nombre
├── ci (unique)
├── domicilio
├── telefono
├── correo (unique)
└── consultantes → Consultante[]

Consultante
├── id_consultante (PK)
├── id_usuario (FK, unique)
├── est_civil
├── nro_padron (unique)
└── tramites → Tramite[]

Grupo
├── id_grupo (PK)
├── nombre
├── descripcion
├── activo
└── tramites → Tramite[]

Tramite
├── id_tramite (PK)
├── id_consultante (FK)
├── id_grupo (FK)
├── num_carpeta (unique)
├── estado
├── observaciones
├── fecha_inicio
├── fecha_cierre
├── motivo_cierre
├── process_instance_id    # ID de la instancia en Camunda
└── notificaciones → Notificacion[]

Notificacion
├── id_notificacion (PK)
├── id_tramite (FK)
├── tipo_notificacion
├── mensaje
├── enviado
└── created_at
```

### Conectarse a PgAdmin

1. Abrir http://localhost:8080
2. Login: `admin@sgst.com` / `admin123`
3. Agregar servidor:
   - **Name**: SGST PostgreSQL
   - **Host**: sgst_postgres
   - **Port**: 5432
   - **Database**: sgst_db
   - **Username**: sgst_user
   - **Password**: sgst_password

---

## 🔧 Comandos Útiles

### Docker Compose

```powershell
# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f orchestrator

# Reconstruir un servicio
docker-compose up -d --build frontend
docker-compose up -d --build backend

# Reiniciar un servicio
docker-compose restart backend
```

### Base de Datos

```powershell
# Conectarse a PostgreSQL
docker exec -it sgst_postgres psql -U sgst_user -d sgst_db

# Ver bases de datos
docker exec -it sgst_postgres psql -U sgst_user -l

# Ejecutar query
docker exec -it sgst_postgres psql -U sgst_user -d sgst_db -c "SELECT * FROM \"Usuario\";"
```

### Prisma (Backend)

```powershell
# Generar Prisma Client
docker exec -it sgst_backend npm run prisma:generate

# Ejecutar migraciones
docker exec -it sgst_backend npm run prisma:migrate

# Abrir Prisma Studio (GUI)
docker exec -it sgst_backend npm run prisma:studio
```

### Contenedores

```powershell
# Ejecutar comando en un contenedor
docker exec -it sgst_backend sh
docker exec -it sgst_postgres psql -U sgst_user -d sgst_db

# Ver logs en tiempo real
docker logs -f sgst_backend
docker logs -f sgst_orchestrator

# Ver información de red
docker network inspect sgst_sgst_network
```

---

## 💻 Tecnologías Utilizadas

### Frontend
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Nginx** - Servidor web (producción)

### Backend
- **Node.js 18** - Runtime
- **Express** - Framework web
- **TypeScript** - Tipado estático
- **Prisma ORM** - ORM para PostgreSQL
- **Axios** - Cliente HTTP

### Workflow Engine
- **Camunda BPM Platform** - Motor de procesos
- **BPMN 2.0** - Estándar de procesos de negocio

### Base de Datos
- **PostgreSQL 15** - Base de datos relacional
- **PgAdmin 4** - Administrador de PostgreSQL

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación
- **Dockerfile** - Build de imágenes

---

## 🐛 Solución de Problemas

### Contenedores no inician

```powershell
# Ver logs
docker-compose logs

# Ver configuración
docker-compose config

# Reiniciar todo
docker-compose down
docker-compose up -d --build
```

### Error de conexión a la base de datos

```powershell
# Verificar PostgreSQL
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Limpiar todo y empezar de nuevo

```powershell
# ⚠️ ATENCIÓN: Esto elimina TODOS los datos
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### El frontend no carga

```powershell
# Ver logs del frontend
docker-compose logs frontend

# Reconstruir frontend
docker-compose up -d --build frontend
```

### El orchestrator muestra error 405

Este error fue corregido cambiando el método de GET a POST en el endpoint `/external-task/fetchAndLock` de la API de Camunda. Si ves este error:
- Reinicia el orchestrator: `docker-compose restart orchestrator`
- Verifica los logs: `docker-compose logs orchestrator`

---

## 📝 Credenciales por Defecto

### PostgreSQL
- Usuario: `sgst_user`
- Contraseña: `sgst_password`
- Puerto: `5432`

### PgAdmin
- Email: `admin@sgst.com`
- Contraseña: `admin123`
- Puerto: `8080`

### Camunda
- Usuario: `admin`
- Contraseña: `admin`
- Puerto: `8081`

> ⚠️ **IMPORTANTE**: Cambia estas credenciales en producción.

---

## 📚 Documentación Adicional

Para más información detallada, consulta:

- **[GUIA_PGADMIN.md](GUIA_PGADMIN.md)** - Guía completa para usar PgAdmin
- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Configuración detallada de Docker
- **[ARQUITECTURA_CAMUNDA.md](ARQUITECTURA_CAMUNDA.md)** - Arquitectura de Camunda
- **[IMPLEMENTACION_FLUJO.md](IMPLEMENTACION_FLUJO.md)** - Implementación de flujos
- **[DATABASES_CONFIG.md](DATABASES_CONFIG.md)** - Configuración de bases de datos

---

## 🎯 Desarrollo Local (Sin Docker)

Si prefieres desarrollar sin Docker:

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

### Backend

```bash
cd backend
npm install
npm run dev    # http://localhost:3001
```

### Orchestrator

```bash
cd orchestrator
npm install
npm run dev    # http://localhost:3002
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

ISC

---

**¿Necesitas ayuda?** Consulta la sección de [Solución de Problemas](#-solución-de-problemas) o revisa los logs con `docker-compose logs -f`.
