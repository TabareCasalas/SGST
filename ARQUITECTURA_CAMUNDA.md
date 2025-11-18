# Arquitectura de Integración Camunda - SGST

## Visión General

Este documento describe la arquitectura de integración de Camunda con SGST usando un patrón de orquestación con tareas externas.

## Diagrama de Arquitectura

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
│  │  - TramiteController                                    │  │
│  │  - UserController                                       │  │
│  │  - Business Logic                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│             Orchestrator Service (Node.js + TypeScript)         │
│                        localhost:3002                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • External Task Client (camunda-external-task-client) │  │
│  │  • Handlers:                                           │  │
│  │    - crear-tramite                                    │  │
│  │    - actualizar-estado                                │  │
│  │    - enviar-notificacion                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────┬──────────────────────────────────────────┬───────────┘
           │                                          │
           │ External Task Pattern                    │ HTTP Requests
           │                                          │
           ▼                                          ▼
┌──────────────────────────┐            ┌──────────────────────────┐
│   Camunda BPM Platform  │            │   Backend API            │
│    localhost:8081        │            │   localhost:3001         │
│  ┌────────────────────┐  │            │  ┌──────────────────┐    │
│  │ • Process Engine  │  │────────────▶│  │ /api/tramites    │    │
│  │ • Cockpit         │  │            │  │ /api/users       │    │
│  │ • Tasklist        │  │            │  │ /api/notific...  │    │
│  │ • Admin           │  │            │  └──────────────────┘    │
│  └────────────────────┘  │            └──────────────────────────┘
│                           │
│  ┌────────────────────┐  │
│  │  BPMN Diagrams     │  │
│  │  • prueba.bpmn     │  │
│  │  • flujo-tramite   │  │
│  └────────────────────┘  │
└──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                         │
│                         localhost:5432                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • sgst_db (Aplicación)                                 │  │
│  │  • Tablas: tramites, usuarios, notificaciones, etc.    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Comunicación

### 1. Usuario Solicita Trámite
```
Usuario → Frontend → Backend API → PostgreSQL
              │
              ▼
         (Opcional: Inicia proceso Camunda)
```

### 2. Proceso en Camunda
```
Backend/Usuario → Camunda → Orchestrator → Backend → PostgreSQL
                          ↓
                   External Task
```

### 3. Manejo de Tareas Externas

**Camunda** crea una external task para una actividad del proceso.

**Orchestrator**:
1. Se suscribe al topic de la tarea
2. Recibe la tarea desde Camunda
3. Llama al backend API
4. Obtiene respuesta del backend
5. Completa la tarea en Camunda
6. Camunda continúa con el siguiente paso

## Patrón External Task

Las external tasks permiten:
- ✅ Separar la lógica de negocio del motor de procesos
- ✅ Comunicarse con sistemas externos
- ✅ Mantener el backend desacoplado de Camunda
- ✅ Escalar independientemente el orquestador

## Componentes

### 1. Camunda Engine
- **Función**: Motor de procesos BPMN
- **Puerto**: 8081
- **Acceso**: http://localhost:8081

### 2. Orchestrator
- **Función**: Bridge entre Camunda y Backend
- **Puerto**: 3002
- **Tecnología**: Node.js + TypeScript
- **Librería**: camunda-external-task-client-js

### 3. Backend API
- **Función**: Lógica de negocio y persistencia (comandos pasan primero por Camunda)
- **Puerto**: 3001
- **Tecnología**: Node.js + Express + Prisma

### 4. PostgreSQL
- **Función**: Base de datos principal
- **Puerto**: 5432
- **Schema**: Prisma ORM

## Topics de External Tasks

| Topic | Handler | Descripción |
|-------|---------|-------------|
| `crear-tramite` | createTramite | Crea un trámite en el backend y devuelve `id_tramite` al proceso |
| `actualizar-estado` | updateEstado | Actualiza el estado de un trámite (solo llamadas internas desde Camunda) |
| `enviar-notificacion` | sendNotification | Envía notificaciones al usuario |

### Despliegue de diagramas

- Todos los archivos `.bpmn`, `.dmn` o `.cmmn` ubicados en `camunda/diagrams/` se copian automáticamente dentro del contenedor en `/camunda/configuration/resources` al iniciar Camunda.
- Cualquier cambio en un diagrama requiere reiniciar el contenedor `camunda` para que se despliegue la versión actualizada.
- Este montaje funciona tanto en `docker-compose.yml` como en `docker-compose.dev.yml`, por lo que el mismo directorio local se usa en todos los entornos.

## Beneficios de esta Arquitectura

1. **Separación de Responsabilidades**
   - Backend: Lógica de negocio
   - Orchestrator: Integración con Camunda
   - Camunda: Orquestación de procesos

2. **Escalabilidad**
   - Orchestrator puede escalarse independientemente
   - Múltiples instancias de orchestrator pueden consumir tareas

3. **Mantenibilidad**
   - Código de Camunda separado del backend
   - Fácil agregar nuevos handlers

4. **Testing**
   - Cada componente se puede testear independientemente
   - Orchestrator mockeable para tests

## Endpoints expuestos por el Orchestrator

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/procesos/iniciar` | Inicia un proceso vía message start (`inicio_tramite_grupo`) con variables iniciales (usa `processKey` y `messageName`). |
| `POST /api/procesos/:instanceId/mensajes/:messageName` | Correlaciona eventos de mensaje (`to_pendiente`, `to_finalizado`, etc.) con variables opcionales. |
| `POST /api/procesos/:instanceId/tareas/:taskId/completar` | Completa una user task específica. |
| `POST /api/procesos/:instanceId/completar-tarea` | Completa automáticamente la última tarea activa cuando no se conoce el `taskId` (compatibilidad). |
| `POST /api/procesos/:instanceId/variables` | Actualiza variables de proceso (`modifications`). |
| `GET /health` | Health check del orchestrator. |

> **Seguridad:** todas las llamadas internas del orchestrator hacia el backend incluyen la cabecera `x-orchestrator-token`. Configurar `ORCHESTRATOR_TOKEN` en backend y orchestrator para validar el origen de los requests internos.

## Flujo Camunda-first (resumen)

1. **Solicitud de creación**
   - Frontend envía `POST /api/tramites` → Backend valida y dispara `POST /api/procesos/iniciar` al orchestrator.
   - Camunda arranca `procesoTramiteGrupos`, ejecuta `crear-tramite` (external task) que persiste la entidad y devuelve `id_tramite`.
   - Inmediatamente Camunda llama a `actualizar-estado` para fijar `en_tramite` o `pendiente` según variables de inicio.

2. **Transiciones de estado**
   - Cualquier cambio de estado solicitado por la UI o backend se convierte en un `POST /api/procesos/:instanceId/mensajes/:messageName`.
   - Camunda decide la transición, ejecuta `actualizar-estado` y `enviar-notificacion`.

3. **Eventos operativos**
   - Acciones como actualizar hoja de ruta o subir documentos disparan mensajes (`actualizar_hoja_ruta`, `subir_archivo`) que activan event subprocess en Camunda y las tareas correspondientes en SGST.

4. **Cierre de proceso**
   - Al finalizar (`to_finalizado`/`to_desistido`) Camunda notifica, ejecuta tareas finales y espera `cerrar_tramite` para terminar definitivamente la instancia.

## Variables relevantes del proceso

- `id_consultante`, `id_grupo`, `num_carpeta`, `observaciones`
- `grupoNombre` (formato `grupo_<nombre>` para mapear a Camunda Tasklist)
- `estadoInicial`
- `id_tramite` (seteado por la task `crear-tramite`)
- `process_instance_id` (persistido en la tabla `tramite`)
- `userId`, `rol_creador` (opcional, usado para auditoría)

## Cómo Usar

### Iniciar todos los servicios
```bash
docker-compose up -d
```

### Ver logs del orchestrator
```bash
docker logs sgst_orchestrator -f
```

### Ver procesos en Camunda
1. Acceder a http://localhost:8081
2. Login: admin/admin
3. Ver procesos en Cockpit

### Agregar nuevo handler
1. Editar `orchestrator/src/index.ts`
2. Agregar nuevo `client.subscribe()`
3. Reconstruir imagen: `docker-compose build orchestrator`
4. Reiniciar: `docker-compose restart orchestrator`

## Troubleshooting

### Orchestrator no recibe tareas
- Verificar que Camunda esté corriendo: http://localhost:8081
- Revisar logs: `docker logs sgst_orchestrator`
- Verificar que el processId sea correcto en Camunda

### Backend no responde
- Verificar que el backend esté corriendo
- Revisar `BACKEND_URL` en orchestrator
- Verificar conectividad entre contenedores

### BPMN no se carga
- Copiar archivo BPMN a `camunda/diagrams/`
- Reiniciar Camunda: `docker-compose restart camunda`
- Cargar proceso manualmente en Cockpit

