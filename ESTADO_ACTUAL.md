# Estado Actual del Proyecto SGST

## Sistema de Gestión de Trámites - Clínica Notarial Universitaria

**Última actualización:** Octubre 2024

---

## 📋 Resumen Ejecutivo

Sistema full-stack integrado con Camunda BPM para la gestión de trámites notariales en un entorno académico. Incluye autenticación JWT, gestión de usuarios con roles jerárquicos, grupos de trabajo, y workflows automatizados.

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** (PostgreSQL)
- **JWT** (bcrypt para contraseñas)
- **Puerto:** 3001

#### Frontend
- **React** + **TypeScript** + **Vite**
- **Context API** para estado global
- **Puerto:** 3000

#### Orquestador (Orchestrator)
- **Node.js** + **TypeScript**
- Maneja external tasks de Camunda
- **Puerto:** 3002

#### Motor de Procesos
- **Camunda BPM Platform** 7.x
- **Puerto:** 8081

#### Base de Datos
- **PostgreSQL** 15
- **PgAdmin** para administración (puerto 8080)

### Contenedorización
- **Docker Compose** orquesta 6 servicios:
  - `postgres` (base de datos)
  - `pgadmin` (administración BD)
  - `backend` (API REST)
  - `frontend` (interfaz web)
  - `camunda` (motor BPM)
  - `orchestrator` (worker de external tasks)

---

## 👥 Sistema de Usuarios y Roles

### Jerarquía de Roles

1. **Administrador de Sistema** (`administrador_sistema`)
   - Control total del sistema
   - Gestión de usuarios y configuraciones

2. **Administrador Docente** (`administrador_docente`)
   - Crea trámites y asigna grupos
   - Finaliza o marca trámites como desistidos
   - Gestiona grupos de trabajo

3. **Administrador Administrativo** (`administrador_administrativo`)
   - Gestión operativa y administrativa

4. **Docente Responsable** (`docente_responsable`)
   - Líder de un grupo de trabajo
   - Revisa y aprueba trabajos
   - Marca trámites para corrección o aprobación

5. **Docente Asistente** (`docente_asistente`)
   - Colabora en grupos de trabajo
   - Asiste en la revisión de trámites

6. **Estudiante** (`estudiante`)
   - Trabaja en trámites asignados a su grupo
   - Sube documentos y elabora dictámenes

7. **Consultante** (`consultante`)
   - Cliente externo que solicita trámites
   - Información almacenada en tabla separada

### Grupos de Trabajo

- Compuestos por:
  - **1 Docente Responsable** (obligatorio)
  - **Mínimo 2 Docentes Asistentes** (obligatorio)
  - **N Estudiantes** (variable)

- Tabla `UsuarioGrupo` maneja relación many-to-many
- Campo `rol_en_grupo`: `responsable`, `asistente`, `estudiante`

---

## 🔐 Autenticación y Seguridad

### Sistema JWT Implementado

**Endpoints de Autenticación:**
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuario actual (protegido)

**Tokens:**
- **Access Token:** 15 minutos (operaciones)
- **Refresh Token:** 7 días (sesión persistente)
- **Algoritmo:** HS256
- **Storage:** localStorage (frontend)

**Contraseñas:**
- Hasheadas con **bcrypt** (10 rounds)
- Validación en cada login
- Campo `password` en tabla `Usuario`

### Middleware de Autenticación

```typescript
// backend/src/middleware/authMiddleware.ts
export function authMiddleware(req, res, next)
export function authorize(...roles)
```

---

## 🗄️ Modelo de Datos

### Tablas Principales

#### Usuario
```prisma
- id_usuario: Int (PK)
- ci: String (unique)
- correo: String (unique)
- password: String (bcrypt)
- rol: String
- nombre, domicilio, telefono
- activo: Boolean
- semestre: String? (estudiantes)
- refresh_token: String?
- created_at, updated_at
```

#### UsuarioGrupo (Junction Table)
```prisma
- id_usuario_grupo: Int (PK)
- id_usuario: Int (FK)
- id_grupo: Int (FK)
- rol_en_grupo: String
- created_at, updated_at
- @@unique([id_usuario, id_grupo])
```

#### Grupo
```prisma
- id_grupo: Int (PK)
- nombre: String
- descripcion: String?
- activo: Boolean
- created_at, updated_at
- miembros_grupo: UsuarioGrupo[]
- tramites: Tramite[]
```

#### Tramite
```prisma
- id_tramite: Int (PK)
- id_consultante: Int (FK)
- id_grupo: Int (FK)
- num_carpeta: Int (unique)
- estado: String
- observaciones: String?
- fecha_inicio, fecha_cierre
- motivo_cierre: String?
- process_instance_id: String? (Camunda)
- created_at, updated_at
```

**Estados de Trámite:**
- `pendiente_asignacion`
- `en_revision`
- `requiere_correccion`
- `aprobado`
- `rechazado`
- `finalizado`
- `desistido`

#### Consultante
```prisma
- id_consultante: Int (PK)
- id_usuario: Int (FK, unique)
- est_civil: String
- nro_padron: Int (unique)
- created_at
```

#### Notificacion
```prisma
- id_notificacion: Int (PK)
- id_tramite: Int (FK)
- tipo: String
- mensaje: String
- leida: Boolean
- created_at
```

#### Auditoria
```prisma
- id_auditoria: Int (PK)
- id_usuario: Int (FK)
- tipo_entidad: String
- id_entidad: Int?
- accion: String
- detalles: String
- ip_address: String?
- created_at
```

---

## 🔄 Integración con Camunda

### Procesos BPMN Desplegados

1. **flujo-tramite.bpmn** (legacy - operativo)
   - Process ID: `procesoTramite`
   - Sin candidate groups

2. **flujo-tramite-grupos.bpmn** (nuevo - en uso)
   - Process ID: `procesoTramiteGrupos`
   - Usa `candidateGroups` para asignación
   - Tareas asignadas automáticamente a grupos

### Workflow Principal

```
1. Inicio del Trámite
   ↓
2. Asignar Grupo (External Task)
   ↓
3. Elaboración (User Task - estudiantes)
   ↓
4. Entrega Parcial (User Task)
   ↓
5. Revisión Docente (User Task - responsable)
   ↓
6. Gateway de Decisión
   ├─ Aprobado → Notificación → Finalizar
   ├─ Requiere Corrección → Volver a Elaboración
   └─ Detenido → Esperar Signal de Reanudación
```

### External Tasks Topics

El orchestrator maneja:
- `asignar-grupo`: Asigna grupo al iniciar proceso
- `actualizar-estado`: Actualiza estado en BD
- `enviar-notificacion`: Crea notificaciones
- `finalizar-tramite`: Marca como finalizado

### Candidate Groups

```javascript
// Al crear trámite en backend
grupoNombre: `grupo_${grupo.nombre}`
// Ejemplo: "grupo_Grupo A - Derecho Civil"

// En BPMN
camunda:candidateGroups="${grupoNombre}"
```

### Claim Automático

Servicio `camundaClaimService.ts`:
```typescript
crearClaim(processInstanceId, candidateGroup)
claimTask(taskId, userId)
unclaimTask(taskId)
assignTask(taskId, userId)
```

---

## 🎨 Frontend - Interfaz de Usuario

### Pantalla de Login

**Componente:** `Login.tsx` + `Login.css`
- Diseño moderno con gradiente
- Validación de formularios
- Mensajes de error amigables
- Credenciales de prueba visibles

### Dashboard Principal

**Componente:** `App.tsx`
- Sidebar con navegación modular
- Header con nombre y rol del usuario
- Botón de logout en footer
- Indicador de rol con badge

### Módulos de Navegación

#### Módulo de Trámites
- 📋 Ver Trámites (`TramitesList.tsx`)
- ➕ Crear Trámite (`CreateTramiteForm.tsx`)

#### Módulo de Usuarios
- 👥 Ver Grupos (`GruposList.tsx`)
- ➕ Crear Grupo (`CreateGrupoForm.tsx`)
- 👤 Ver Usuarios (`UsuariosList.tsx`)
- 👤 Registrar Usuario (`CreateUsuarioForm.tsx`)

### Contextos React

1. **AuthContext** (`contexts/AuthContext.tsx`)
   - Estado global de autenticación
   - Login/logout
   - Refresh token automático

2. **ToastContext** (`contexts/ToastContext.tsx`)
   - Notificaciones toast
   - Success/Error/Info/Warning

### Servicios API

**ApiService** (`services/api.ts`):
- Helper `getAuthHeaders()` - Añade token JWT
- Autenticación: login, logout, refresh, getCurrentUser
- Trámites: CRUD completo
- Usuarios: CRUD con filtros
- Grupos: CRUD + addMiembro
- Consultantes: CRUD

---

## 📊 Datos de Prueba

### Script de Seed

**Archivo:** `backend/prisma/seed.ts`

**Contraseña por defecto:** `password123`

### Usuarios Creados (19 totales)

#### Administradores (3)
| CI | Nombre | Rol | Email |
|----|--------|-----|-------|
| 12345678 | Carlos Administrador | admin_sistema | admin@sistema.com |
| 87654321 | María Directora | admin_docente | directora@universidad.com |
| 34567890 | Juan Secretario | admin_administrativo | secretario@universidad.com |

#### Docentes Responsables (2)
| CI | Nombre | Email |
|----|--------|-------|
| 11111111 | Dr. Roberto Fernández | roberto.fernandez@universidad.com |
| 22222222 | Dra. Ana Martínez | ana.martinez@universidad.com |

#### Docentes Asistentes (5)
| CI | Nombre |
|----|--------|
| 33333333 | Lic. Pedro García |
| 44444444 | Lic. Laura Rodríguez |
| 10101010 | Lic. Diego Sánchez |
| 20202020 | Lic. Sofía Pérez |
| 30303030 | Lic. Martín López |

#### Estudiantes (6)
| CI | Nombre | Grupo |
|----|--------|-------|
| 55555555 | Lucía González | Grupo A |
| 66666666 | Mateo Silva | Grupo A |
| 77777777 | Valentina Castro | Grupo A |
| 88888888 | Santiago Ramírez | Grupo B |
| 99999999 | Camila Torres | Grupo B |
| 15151515 | Federico Morales | Grupo B |

#### Consultantes (3)
| CI | Nombre | Estado Civil |
|----|--------|--------------|
| 40404040 | Andrés Méndez | Soltero |
| 50505050 | Patricia Vega | Casada |
| 60606060 | Ricardo Núñez | Divorciado |

### Grupos Configurados (2)

**Grupo A - Derecho Civil**
- Responsable: Dr. Roberto Fernández
- Asistentes: Pedro García, Laura Rodríguez
- Estudiantes: Lucía, Mateo, Valentina

**Grupo B - Derecho Notarial**
- Responsable: Dra. Ana Martínez
- Asistentes: Diego Sánchez, Sofía Pérez, Martín López
- Estudiantes: Santiago, Camila, Federico

---

## 🚀 Despliegue y Ejecución

### Comandos Docker

```bash
# Levantar todos los servicios
docker-compose up -d

# Reconstruir servicios
docker-compose up --build -d

# Ver logs
docker-compose logs -f [servicio]

# Detener servicios
docker-compose down

# Ver estado
docker-compose ps
```

### Comandos de Base de Datos

```bash
# Dentro del contenedor backend

# Aplicar schema
docker-compose exec backend npx prisma db push

# Generar cliente Prisma
docker-compose exec backend npx prisma generate

# Ejecutar seed
docker-compose exec backend npm run seed

# Resetear BD + seed
docker-compose exec backend npm run db:reset
```

### URLs de Acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interfaz de usuario |
| **Backend API** | http://localhost:3001 | REST API |
| **Orchestrator** | http://localhost:3002 | Worker externo |
| **Camunda Cockpit** | http://localhost:8081 | Monitor de procesos |
| **PgAdmin** | http://localhost:8080 | Admin PostgreSQL |

---

## 🔧 Estructura del Proyecto

```
SGST/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelo de datos
│   │   └── seed.ts                # Datos de prueba
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts  # Autenticación
│   │   │   ├── usuarioController.ts
│   │   │   ├── grupoController.ts
│   │   │   ├── tramiteController.ts
│   │   │   ├── consultanteController.ts
│   │   │   └── notificacionController.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts  # Verificación JWT
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── usuarioRoutes.ts
│   │   │   ├── grupoRoutes.ts
│   │   │   ├── tramiteRoutes.ts
│   │   │   ├── consultanteRoutes.ts
│   │   │   └── notificacionRoutes.ts
│   │   ├── services/
│   │   │   ├── orchestratorService.ts   # Comunicación Camunda
│   │   │   └── camundaClaimService.ts   # Claims automáticos
│   │   ├── lib/
│   │   │   └── prisma.ts          # Cliente Prisma
│   │   └── index.ts               # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx          # Pantalla de login
│   │   │   ├── TramitesList.tsx
│   │   │   ├── CreateTramiteForm.tsx
│   │   │   ├── UsuariosList.tsx
│   │   │   ├── CreateUsuarioForm.tsx
│   │   │   ├── GruposList.tsx
│   │   │   ├── CreateGrupoForm.tsx
│   │   │   ├── NotificationBanner.tsx
│   │   │   ├── RechazoModal.tsx
│   │   │   ├── TareaCard.tsx
│   │   │   └── ToastContainer.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx    # Estado autenticación
│   │   │   └── ToastContext.tsx   # Notificaciones
│   │   ├── services/
│   │   │   └── api.ts             # Cliente API
│   │   ├── types/
│   │   │   └── tramite.ts
│   │   ├── App.tsx                # Componente raíz
│   │   ├── App.css
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
│
├── orchestrator/
│   ├── src/
│   │   ├── index.ts               # Worker principal
│   │   ├── deployment.ts          # Deploy BPMN
│   │   └── logger.ts
│   ├── Dockerfile
│   └── package.json
│
├── camunda/
│   └── diagrams/
│       ├── flujo-tramite.bpmn          # Legacy
│       ├── flujo-tramite-grupos.bpmn   # Actual (con groups)
│       └── flujo-tramite-example.bpmn  # Ejemplo
│
├── docker-compose.yml             # Orquestación de servicios
├── env.example                    # Variables de entorno
├── README.md                      # Documentación principal
└── ESTADO_ACTUAL.md              # Este archivo
```

---

## ✅ Funcionalidades Implementadas

### Backend
- ✅ API REST completa (Express + TypeScript)
- ✅ Autenticación JWT (access + refresh tokens)
- ✅ Hasheo de contraseñas (bcrypt)
- ✅ CRUD de usuarios con 8 roles
- ✅ Gestión de grupos (many-to-many con roles)
- ✅ CRUD de trámites con estados
- ✅ Integración con Camunda (iniciar procesos)
- ✅ Servicio de claims automáticos
- ✅ Sistema de notificaciones
- ✅ Auditoría de acciones
- ✅ Middleware de autorización por rol
- ✅ Prisma ORM con migraciones

### Frontend
- ✅ Pantalla de login moderna
- ✅ Dashboard con sidebar modular
- ✅ Gestión de sesión (AuthContext)
- ✅ Navegación por roles
- ✅ CRUD de trámites
- ✅ CRUD de usuarios
- ✅ CRUD de grupos
- ✅ Sistema de toasts
- ✅ Notificaciones en banner
- ✅ Modal de rechazo
- ✅ Tarjetas de tareas
- ✅ Diseño responsive

### Orchestrator
- ✅ Polling de external tasks
- ✅ Despliegue automático de BPMN
- ✅ Handlers de topics
- ✅ Logging estructurado
- ✅ Health checks

### Camunda
- ✅ Motor BPM operativo
- ✅ BPMN con candidate groups
- ✅ External tasks configurados
- ✅ User tasks con asignación
- ✅ Gateways de decisión
- ✅ Signals para reanudación

### Docker
- ✅ 6 servicios orquestados
- ✅ Health checks configurados
- ✅ Volúmenes persistentes
- ✅ Red interna
- ✅ Build multi-stage

### Base de Datos
- ✅ Schema completo con relaciones
- ✅ Índices optimizados
- ✅ Constraints de integridad
- ✅ Seed con datos de prueba
- ✅ Migraciones versionadas

---

## ⚠️ Problemas Conocidos y Soluciones

### 1. Error: "Column password does not exist"
**Causa:** Schema no sincronizado con BD  
**Solución:**
```bash
docker-compose exec backend npx prisma db push --accept-data-loss
docker-compose exec backend npm run seed
```

### 2. Error: "Cannot POST /api/auth/login"
**Causa:** Backend no compiló archivos de autenticación  
**Solución:**
```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

### 3. BPMN no despliega (error 400/500)
**Causa:** Sintaxis inválida en XML o encoding  
**Verificar:**
- Archivo en UTF-8
- `procesoTramiteGrupos` como Process ID
- Variables `${grupoNombre}` definidas

### 4. Seed falla con error de tipos
**Causa:** Archivo `src/seed.ts` duplicado  
**Solución:** Solo debe existir `prisma/seed.ts`

### 5. Frontend: "Unexpected token '<'"
**Causa:** Endpoint no existe, devuelve HTML  
**Verificar:** Backend levantado y compilado correctamente

---

## 🎯 Próximas Mejoras Sugeridas

### Corto Plazo
- [ ] Proteger rutas del frontend por rol
- [ ] Implementar upload de documentos (multer)
- [ ] Dashboard con estadísticas
- [ ] Filtros avanzados en listados
- [ ] Paginación en tablas
- [ ] Ordenamiento de columnas

### Mediano Plazo
- [ ] WebSockets para notificaciones real-time
- [ ] Sistema de comentarios en trámites
- [ ] Historial de cambios (audit trail visual)
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Búsqueda full-text
- [ ] Notificaciones por email

### Largo Plazo
- [ ] Migrar a Redis para refresh tokens
- [ ] Implementar rate limiting
- [ ] Tests automatizados (Jest, Cypress)
- [ ] CI/CD pipeline
- [ ] Documentación API (Swagger/OpenAPI)
- [ ] Monitoreo con Prometheus/Grafana
- [ ] Backups automatizados
- [ ] Multi-tenant support

---

## 📝 Notas de Desarrollo

### Convenciones de Código

**Backend:**
- Controllers en plural (`usuarioController.ts`)
- Rutas en plural (`/api/usuarios`)
- Nombres de funciones descriptivos
- Try-catch en todos los endpoints
- Status codes HTTP correctos

**Frontend:**
- Componentes en PascalCase
- Hooks personalizados con `use` prefix
- CSS modules por componente
- Type safety con TypeScript
- Props interface en cada componente

**Base de Datos:**
- Nombres en español
- snake_case para campos
- Índices en FKs
- Timestamps automáticos (created_at, updated_at)

### Variables de Entorno

```env
# Backend
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="secret-key"
REFRESH_SECRET="refresh-secret"
PORT=3001

# Camunda
CAMUNDA_URL="http://camunda:8080/engine-rest"

# Frontend (build time)
VITE_API_URL="http://localhost:3001/api"
```

---

## 🤝 Equipo y Contacto

**Proyecto:** Sistema de Gestión de Trámites  
**Cliente:** Clínica Notarial Universitaria  
**Versión:** 1.0.0  
**Fecha:** Octubre 2024

---

## 📚 Referencias

- [Documentación Camunda BPM](https://docs.camunda.org/manual/7.21/)
- [Prisma ORM Docs](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Docker Compose](https://docs.docker.com/compose/)

---

**Fin del documento**

