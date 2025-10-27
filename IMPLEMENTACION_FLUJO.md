# Implementación del Flujo SGST con Camunda

## 📋 Resumen de Cambios Realizados

Se ha implementado el flujo descrito en `contextoClinicaNotarialAgustin.md`, ajustando el orchestrator y el diagrama BPMN para seguir el flujo correcto.

## 🔄 Flujo Implementado

```
1. Usuario crea trámite → Frontend → Backend
2. Backend guarda trámite en PostgreSQL
3. Backend → Orchestrator (POST /api/procesos/iniciar)
4. Orchestrator → Camunda (Inicia proceso BPMN)
5. Camunda → Orchestrator (Asigna external tasks)
6. Orchestrator → Backend (Ejecuta acciones: actualizar estado, notificar)
7. Backend actualiza PostgreSQL
8. Frontend muestra estado actualizado
```

## 🏗️ Arquitectura Ajustada

### 1. Orchestrator (Puerto 3002)

El orchestrator ahora tiene **DOS funcionalidades principales**:

#### A. Endpoint REST para Iniciar Procesos

**POST `/api/procesos/iniciar`**

Permite que el backend inicie un proceso en Camunda después de guardar un trámite:

```json
{
  "processKey": "procesoTramite",
  "variables": {
    "id_tramite": 123,
    "estado": "en_revision",
    "observaciones": "Trámite iniciado"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "instanceId": "abc-123",
  "processDefinitionId": "xyz-789"
}
```

#### B. Polling de External Tasks

Cada 5 segundos, el orchestrator consulta a Camunda por external tasks pendientes y las ejecuta:

- **actualizar-estado**: Actualiza el estado en el backend
- **enviar-notificacion**: Envía notificaciones al usuario
- **crear-tramite**: Ejecuta lógica adicional (si es necesaria)

### 2. BPMN Diagram Actualizado

El diagrama `flujo-tramite-example.bpmn` fue corregido:

- **Eliminado**: La tarea "Crear Trámite" al inicio (el trámite ya está guardado antes)
- **Agregado**: Gateway de validación inicial
- **External Tasks**: Solo para actualización y notificación
- **User Task**: Para revisión de trámites rechazados

### 3. Dependencias Corregidas

**Antes:**
```json
"camunda-external-task-client": "^2.4.0"
```

**Ahora:**
```json
Solo axios, express, dotenv
```

El orchestrator usa **axios** directamente para comunicarse con Camunda REST API.

## 🔌 Integración Backend → Orchestrator

Cuando el backend guarda un trámite, debe llamar al orchestrator:

```typescript
// En el controller del backend (ejemplo)
async function crearTramite(req, res) {
  // 1. Guardar en base de datos
  const tramite = await db.tramite.create({ ... });
  
  // 2. Notificar al orchestrator para iniciar proceso
  await axios.post('http://orchestrator:3002/api/procesos/iniciar', {
    processKey: 'procesoTramite',
    variables: {
      id_tramite: tramite.id,
      estado: 'iniciado',
      observaciones: 'Trámite creado'
    }
  });
  
  res.json(tramite);
}
```

## 📡 Comunicación Camunda ↔ Orchestrator

### Camunda asigna tareas

Camunda crea external tasks en el proceso y el orchestrator las procesa:

1. Camunda crea task: `actualizar-estado` con variables `{ id_tramite, estado }`
2. Orchestrator consulta: `GET /external-task/fetchAndLock`
3. Orchestrator ejecuta: Llama a backend para actualizar estado
4. Orchestrator completa: `POST /external-task/{id}/complete`
5. Camunda continúa con el siguiente paso

## 🎯 Variables de Entorno

### Orchestrator (`docker-compose.yml`)
```env
ORCHESTRATOR_PORT=3002
CAMUNDA_URL=http://camunda:8080/engine-rest
BACKEND_URL=http://backend:3001
```

### Backend (a implementar)
```env
DATABASE_URL=postgresql://sgst_user:sgst_password@postgres:5432/sgst_db
ORCHESTRATOR_URL=http://orchestrator:3002
```

## 📝 Próximos Pasos

### 1. Implementar Backend Completo

El backend necesita:

**Archivos necesarios:**
- `backend/src/index.ts` - Servidor Express
- `backend/src/controllers/tramiteController.ts` - Lógica de trámites
- `backend/src/routes/tramiteRoutes.ts` - Rutas API
- `backend/prisma/schema.prisma` - Schema de Prisma
- `backend/Dockerfile` - Para contenedor

**Funcionalidad requerida:**
- POST `/api/tramites` - Crear trámite e iniciar proceso
- PATCH `/api/tramites/:id` - Actualizar estado
- GET `/api/tramites/:id` - Obtener trámite
- POST `/api/tramites/notificar` - Enviar notificación

### 2. Ajustar BPMN según necesidades

Modifica el archivo `camunda/diagrams/flujo-tramite-example.bpmn` según tus reglas de negocio.

### 3. Configurar Variables de Proceso

Define las variables que Camunda necesita:
- `id_tramite` (Integer)
- `estado` (String)
- `observaciones` (String)
- `validado` (Boolean)

## 🧪 Probar la Integración

Una vez que el backend esté implementado:

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs del orchestrator
docker logs -f sgst_orchestrator

# Ver logs del backend
docker logs -f sgst_backend

# Ver procesos en Camunda
# http://localhost:8081
# Login: admin/admin
```

## 📊 Diagrama de Arquitectura Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                         Usuario (Web)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                     │
│                         localhost:80                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend API (Node.js + Express)              │
│                        localhost:3001                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/tramites                                      │  │
│  │  1. Guarda en PostgreSQL                                 │  │
│  │  2. Llama a Orchestrator                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼ POST /api/procesos/iniciar
┌─────────────────────────────────────────────────────────────────┐
│             Orchestrator Service (Node.js + TypeScript)         │
│                        localhost:3002                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • Endpoint REST: /api/procesos/iniciar                 │  │
│  │  • Polling External Tasks cada 5 segundos                │  │
│  │  • Handlers: actualizar-estado, enviar-notificacion      │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────┬──────────────────────────────────────────┬───────────┘
           │ Inicia proceso                            │ HTTP
           │                                          │
           ▼                                          ▼
┌──────────────────────────┐            ┌──────────────────────────┐
│   Camunda BPM Platform  │            │   Backend API            │
│    localhost:8081        │            │   localhost:3001         │
│  ┌────────────────────┐  │            │  ┌──────────────────┐    │
│  │ • Process Engine  │  │────────────▶│  │ /api/tramites    │    │
│  │ • External Tasks  │  │            │  │ PATCH            │    │
│  │ • BPMN Diagrams   │  │            │  │ POST /notificar  │    │
│  └────────────────────┘  │            │  └──────────────────┘    │
└──────────────────────────┘            └──────────────────────────┘
          │                                        │
          │                                        │
          ▼                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                         │
│                         localhost:5432                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • sgst_db (Trámites, usuarios, etc)                    │  │
│  │  • camunda_db (Procesos, instancias, tasks)             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## ✅ Checklist de Implementación

- [x] Orchestrator refactorizado con endpoints REST
- [x] Polling de external tasks implementado
- [x] BPMN diagram actualizado
- [x] Dependencias corregidas
- [ ] Backend implementado (pendiente)
- [ ] Frontend integrado con backend (pendiente)
- [ ] Pruebas end-to-end (pendiente)

## 🚀 Comandos Útiles

```bash
# Reconstruir orchestrator después de cambios
docker-compose build orchestrator

# Reiniciar orchestrator
docker-compose restart orchestrator

# Ver estado de external tasks en Camunda
curl http://localhost:8081/engine-rest/external-task

# Ver procesos activos
curl http://localhost:8081/engine-rest/process-instance
```

## 📚 Documentación Relacionada

- `contextoClinicaNotarialAgustin.md` - Contexto original
- `ARQUITECTURA_CAMUNDA.md` - Arquitectura general
- `DATABASES_CONFIG.md` - Configuración de bases de datos
- `orchestrator/README.md` - Documentación del orchestrator


