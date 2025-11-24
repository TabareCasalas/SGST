# Diagrama de Arquitectura - Sistema SGST

## Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Cliente"
        User[👤 Usuario<br/>Navegador Web]
    end

    subgraph "Capa de Presentación"
        Frontend[🌐 Frontend React<br/>Puerto: 80<br/>React 19.1.0 + TypeScript + Vite]
    end

    subgraph "Capa de Aplicación"
        Backend[⚙️ Backend API<br/>Puerto: 3001<br/>Node.js + Express + TypeScript<br/>Prisma ORM]
        Orchestrator[🔄 Orchestrator<br/>Puerto: 3002<br/>Node.js + TypeScript<br/>Zeebe Client]
    end

    subgraph "Capa de Procesos de Negocio"
        Zeebe[⚡ Camunda Zeebe<br/>Puerto: 26500<br/>Motor de Procesos BPMN]
        Operate[📊 Camunda Operate<br/>Puerto: 8081<br/>Monitoreo y Gestión]
        Tasklist[📋 Camunda Tasklist<br/>Puerto: 8082<br/>Gestión de Tareas]
        Identity[🔐 Camunda Identity<br/>Puerto: 8083<br/>Autenticación]
    end

    subgraph "Capa de Datos"
        PostgreSQL[(🗄️ PostgreSQL<br/>Puerto: 5432<br/>sgst_db + camunda_db)]
        Elasticsearch[(🔍 Elasticsearch<br/>Puerto: 9200<br/>Índices de Camunda)]
        FileStorage[📁 Almacenamiento<br/>backend/uploads<br/>Documentos y Archivos]
    end

    subgraph "Herramientas de Administración"
        PgAdmin[🛠️ PgAdmin<br/>Puerto: 8080<br/>Administración BD]
    end

    %% Conexiones Cliente
    User -->|HTTP/HTTPS| Frontend

    %% Conexiones Frontend
    Frontend -->|HTTP REST<br/>JWT Auth| Backend

    %% Conexiones Backend
    Backend -->|HTTP REST<br/>x-orchestrator-token| Orchestrator
    Backend -->|Prisma ORM<br/>SQL| PostgreSQL
    Backend -->|File System| FileStorage

    %% Conexiones Orchestrator
    Orchestrator -->|Zeebe Protocol<br/>gRPC| Zeebe
    Orchestrator -->|HTTP REST<br/>x-orchestrator-token| Backend

    %% Conexiones Camunda
    Zeebe -->|JDBC| PostgreSQL
    Zeebe -->|Export| Elasticsearch
    Operate -->|HTTP| Zeebe
    Operate -->|HTTP| Elasticsearch
    Tasklist -->|HTTP| Zeebe
    Tasklist -->|HTTP| Elasticsearch
    Tasklist -->|GraphQL| Operate
    Identity -->|JDBC| PostgreSQL

    %% Conexiones Administración
    PgAdmin -->|JDBC| PostgreSQL

    %% Estilos
    classDef frontend fill:#61dafb,stroke:#20232a,stroke-width:2px,color:#000
    classDef backend fill:#339933,stroke:#20232a,stroke-width:2px,color:#fff
    classDef orchestrator fill:#ff6b6b,stroke:#20232a,stroke-width:2px,color:#fff
    classDef camunda fill:#ffa500,stroke:#20232a,stroke-width:2px,color:#000
    classDef database fill:#336791,stroke:#20232a,stroke-width:2px,color:#fff
    classDef storage fill:#90ee90,stroke:#20232a,stroke-width:2px,color:#000
    classDef admin fill:#9370db,stroke:#20232a,stroke-width:2px,color:#fff

    class Frontend frontend
    class Backend backend
    class Orchestrator orchestrator
    class Zeebe,Operate,Tasklist,Identity camunda
    class PostgreSQL,Elasticsearch database
    class FileStorage storage
    class PgAdmin admin
```

---

## Flujo de Comunicación Detallado

### 1. Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as PostgreSQL

    U->>F: Login (CI + Password)
    F->>B: POST /api/auth/login
    B->>DB: Validar credenciales
    DB-->>B: Usuario encontrado
    B->>B: Verificar password (bcrypt)
    B->>B: Generar JWT tokens
    B-->>F: Access Token + Refresh Token
    F->>F: Guardar tokens (localStorage)
    F-->>U: Sesión iniciada
```

### 2. Flujo de Creación de Trámite (con Camunda)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant O as Orchestrator
    participant Z as Zeebe
    participant DB as PostgreSQL

    U->>F: Crear trámite
    F->>B: POST /api/tramites
    B->>B: Validar datos y permisos
    B->>O: POST /api/procesos/iniciar<br/>(processKey, variables)
    O->>Z: createProcessInstance<br/>(procesoTramiteGrupos)
    Z->>Z: Ejecutar proceso BPMN
    Z->>O: Job: crear-tramite
    O->>B: POST /api/tramites<br/>(x-orchestrator-token)
    B->>DB: INSERT INTO tramites
    DB-->>B: id_tramite
    B-->>O: Trámite creado
    O->>Z: complete(job, {id_tramite})
    Z->>Z: Job: actualizar-estado
    O->>B: PATCH /api/tramites/{id}
    B->>DB: UPDATE tramites SET estado
    B-->>O: Estado actualizado
    O->>Z: complete(job)
    Z->>Z: Job: enviar-notificacion
    O->>B: POST /api/tramites/notificar
    B->>DB: INSERT INTO notificaciones
    B-->>O: Notificación creada
    O->>Z: complete(job)
    Z-->>O: Proceso completado
    O-->>B: ProcessInstanceKey
    B-->>F: Trámite creado + process_instance_id
    F-->>U: Trámite creado exitosamente
```

### 3. Flujo de Cambio de Estado de Trámite

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant O as Orchestrator
    participant Z as Zeebe
    participant DB as PostgreSQL

    U->>F: Cambiar estado trámite
    F->>B: PATCH /api/tramites/{id}<br/>(estado: "finalizado")
    B->>B: Validar transición permitida
    B->>O: POST /api/procesos/{instanceId}/mensajes/to_finalizado<br/>(correlationKey, variables)
    O->>Z: publishMessage<br/>(messageName: "to_finalizado")
    Z->>Z: Correlacionar mensaje con proceso
    Z->>Z: Ejecutar boundary event
    Z->>O: Job: actualizar-estado
    O->>B: PATCH /api/tramites/{id}<br/>(x-orchestrator-token)
    B->>DB: UPDATE tramites SET estado
    DB-->>B: Trámite actualizado
    B-->>O: Confirmación
    O->>Z: complete(job)
    Z->>Z: Job: enviar-notificacion
    O->>B: POST /api/tramites/notificar
    B->>DB: INSERT INTO notificaciones
    B-->>O: Notificación creada
    O->>Z: complete(job)
    Z-->>O: Mensaje procesado
    O-->>B: Confirmación
    B-->>F: Estado actualizado
    F-->>U: Estado cambiado exitosamente
```

### 4. Flujo de Job Workers (Asíncrono)

```mermaid
sequenceDiagram
    participant Z as Zeebe
    participant O as Orchestrator
    participant B as Backend
    participant DB as PostgreSQL

    loop Polling cada 500ms
        Z->>O: Poll jobs (maxJobsToActivate: 10)
        O->>Z: Activate jobs
        Z-->>O: Job disponible
        
        alt Job: crear-tramite
            O->>B: POST /api/tramites
            B->>DB: INSERT
            DB-->>B: id_tramite
            B-->>O: Trámite creado
            O->>Z: complete(job, {id_tramite})
        else Job: actualizar-estado
            O->>B: PATCH /api/tramites/{id}
            B->>DB: UPDATE
            DB-->>B: Confirmación
            B-->>O: Estado actualizado
            O->>Z: complete(job)
        else Job: enviar-notificacion
            O->>B: POST /api/tramites/notificar
            B->>DB: INSERT notificaciones
            DB-->>B: Notificación creada
            B-->>O: Confirmación
            O->>Z: complete(job)
        end
    end
```

---

## Componentes y Tecnologías

### Frontend
- **Tecnología**: React 19.1.0, TypeScript, Vite
- **Puerto**: 80
- **Comunicación**: HTTP REST con Backend
- **Autenticación**: JWT almacenado en localStorage
- **Estado**: Context API (AuthContext, ToastContext)

### Backend API
- **Tecnología**: Node.js, Express, TypeScript
- **Puerto**: 3001
- **ORM**: Prisma
- **Autenticación**: JWT (access token 8h, refresh token 7d)
- **Seguridad**: bcrypt para passwords, middleware de autenticación
- **Comunicación**:
  - HTTP REST con Frontend
  - HTTP REST con Orchestrator (token especial)
  - Prisma ORM con PostgreSQL

### Orchestrator
- **Tecnología**: Node.js, TypeScript
- **Puerto**: 3002
- **Cliente**: Zeebe Node.js Client
- **Función**: Intermediario entre Camunda y Backend
- **Job Workers**:
  - `crear-tramite`: Crea trámites en el backend
  - `actualizar-estado`: Actualiza estados de trámites
  - `enviar-notificacion`: Envía notificaciones automáticas
- **Configuración**:
  - Poll interval: 500ms
  - Max jobs to activate: 10
  - Timeout: 30 segundos
- **Comunicación**:
  - Zeebe Protocol (gRPC) con Camunda Zeebe
  - HTTP REST con Backend (x-orchestrator-token)

### Camunda 8 (Zeebe)
- **Tecnología**: Camunda Zeebe 8.5.0
- **Puerto**: 26500 (Gateway), 26501 (Gateway Management)
- **Función**: Motor de procesos BPMN
- **Proceso Principal**: `procesoTramiteGrupos`
- **Comunicación**:
  - Zeebe Protocol (gRPC) con Orchestrator
  - JDBC con PostgreSQL (camunda_db)
  - Export a Elasticsearch

### Camunda Operate
- **Puerto**: 8081
- **Función**: Monitoreo y gestión de procesos
- **Comunicación**: HTTP con Zeebe y Elasticsearch

### Camunda Tasklist
- **Puerto**: 8082
- **Función**: Gestión de tareas de usuario
- **Comunicación**: HTTP con Zeebe, Elasticsearch y Operate (GraphQL)

### Camunda Identity
- **Puerto**: 8083
- **Función**: Autenticación y autorización de Camunda
- **Comunicación**: JDBC con PostgreSQL

### PostgreSQL
- **Puerto**: 5432
- **Bases de Datos**:
  - `sgst_db`: Datos de la aplicación (usuarios, trámites, fichas, etc.)
  - `camunda_db`: Datos de procesos BPMN
- **ORM**: Prisma para sgst_db
- **Gestión**: PgAdmin (puerto 8080)

### Elasticsearch
- **Puerto**: 9200
- **Función**: Índices para búsqueda y monitoreo de Camunda
- **Comunicación**: HTTP con Zeebe, Operate y Tasklist

### Almacenamiento de Archivos
- **Ubicación**: `backend/uploads/`
- **Gestión**: Sistema de archivos del servidor
- **Límite**: 10MB por archivo
- **Formatos**: PDF, imágenes, documentos de oficina

---

## Patrones Arquitectónicos

### 1. Arquitectura en Capas
- **Capa de Presentación**: Frontend React
- **Capa de Aplicación**: Backend API + Orchestrator
- **Capa de Procesos**: Camunda Zeebe
- **Capa de Datos**: PostgreSQL + Elasticsearch + File Storage

### 2. Separación de Responsabilidades
- **Backend**: Lógica de negocio y persistencia
- **Orchestrator**: Integración con Camunda (desacoplamiento)
- **Camunda**: Orquestación de procesos de negocio

### 3. Comunicación Asíncrona
- **Job Workers**: Procesamiento asíncrono de tareas
- **Polling**: Orchestrator consulta jobs cada 500ms
- **Mensajes**: Eventos de mensaje para correlación

### 4. Seguridad
- **Autenticación JWT**: Tokens con expiración
- **Token Especial**: x-orchestrator-token para comunicación interna
- **Middleware de Autenticación**: Validación en todas las rutas protegidas
- **Encriptación**: Contraseñas con bcrypt

### 5. Escalabilidad
- **Orchestrator**: Puede escalarse independientemente
- **Job Workers**: Procesamiento paralelo (hasta 10 jobs simultáneos)
- **Base de Datos**: Índices optimizados para consultas frecuentes

---

## Endpoints Principales

### Backend API
- `POST /api/auth/login` - Autenticación
- `GET /api/auth/me` - Usuario actual
- `POST /api/tramites` - Crear trámite
- `PATCH /api/tramites/:id` - Actualizar trámite
- `GET /api/tramites` - Listar trámites
- `POST /api/fichas` - Crear ficha
- `GET /api/usuarios` - Listar usuarios
- `GET /api/notificaciones` - Obtener notificaciones
- `GET /api/reportes` - Generar reportes

### Orchestrator
- `POST /api/procesos/iniciar` - Iniciar proceso BPMN
- `POST /api/procesos/:instanceId/mensajes/:messageName` - Correlacionar mensaje
- `POST /api/procesos/desplegar` - Desplegar diagrama BPMN
- `GET /health` - Health check

---

## Flujos de Datos Principales

### 1. Creación de Trámite
```
Frontend → Backend → Orchestrator → Zeebe → Job Worker → Backend → PostgreSQL
                                                              ↓
                                                         Notificaciones
```

### 2. Cambio de Estado
```
Frontend → Backend → Orchestrator → Zeebe (Mensaje) → Job Workers → Backend → PostgreSQL
```

### 3. Consulta de Datos
```
Frontend → Backend → PostgreSQL → Backend → Frontend
```

### 4. Subida de Documentos
```
Frontend → Backend → File System (uploads/) → Backend → PostgreSQL (metadata)
```

---

## Configuración de Red

### Docker Network: `sgst_network`
- Tipo: Bridge
- Todos los servicios están en la misma red
- Comunicación interna por nombres de servicio

### Puertos Expuestos
- **80**: Frontend (HTTP)
- **3001**: Backend API
- **3002**: Orchestrator
- **5432**: PostgreSQL
- **8080**: PgAdmin
- **8081**: Camunda Operate
- **8082**: Camunda Tasklist
- **8083**: Camunda Identity
- **9200**: Elasticsearch
- **26500**: Zeebe Gateway
- **26501**: Zeebe Gateway Management

---

## Optimizaciones de Rendimiento

### Orchestrator
- Poll interval: 500ms (consultas frecuentes)
- Max jobs to activate: 10 (procesamiento paralelo)
- Timeout: 30 segundos por job
- TimeToLive de mensajes: 30 segundos

### Backend
- Timeouts reducidos: 5 segundos para llamadas HTTP
- Índices en campos frecuentemente consultados
- Consultas optimizadas con Prisma

### Base de Datos
- Índices en relaciones y campos de búsqueda
- Validación de integridad referencial
- Cascadas de eliminación donde aplica

---

## Monitoreo y Salud

### Health Checks
- **Backend**: `GET /health`
- **Orchestrator**: `GET /health`
- **PostgreSQL**: `pg_isready`
- **Elasticsearch**: `curl /_cluster/health`
- **Zeebe**: `curl /actuator/health`
- **Operate/Tasklist/Identity**: `curl /actuator/health`

### Logging
- Todos los servicios registran acciones importantes
- Auditoría completa en base de datos
- Logs de errores y advertencias

---

**Documento generado para el Sistema SGST**
**Fecha: Enero 2025**


