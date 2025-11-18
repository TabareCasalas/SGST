# SGST Orchestrator

Servicio orquestador que actúa como intermediario entre **Camunda Engine** y el **Backend API** de SGST.

## Arquitectura

```
┌─────────────┐      ┌──────────────┐      ┌──────────┐
│   Camunda   │─────▶│ Orchestrator │─────▶│ Backend  │
│   Engine    │      │   (Node.js)  │      │  (API)   │
└─────────────┘      └──────────────┘      └──────────┘
     ↑                       │
     │                       │
     └───────────────────────┘
        External Tasks
```

## Funcionalidad

El orquestador se suscribe a tareas externas de Camunda y actúa como handler para:

- **Crear Trámites**: Recibe solicitudes de Camunda y las envía al backend
- **Actualizar Estados**: Sincroniza estados de trámites entre Camunda y backend
- **Enviar Notificaciones**: Gestiona notificaciones del sistema

## Topics de External Tasks

### `crear-tramite`
Crea un nuevo trámite en el backend.

**Variables de entrada:**
```json
{
  "id_consultante": "number",
  "id_grupo": "number",
  "num_carpeta": "string",
  "observaciones": "string"
}
```

### `actualizar-estado`
Actualiza el estado de un trámite existente.

**Variables de entrada:**
```json
{
  "id_tramite": "number",
  "estado": "string",
  "observaciones": "string"
}
```

### `enviar-notificacion`
Envía una notificación relacionada con un trámite.

**Variables de entrada:**
```json
{
  "id_tramite": "number",
  "tipo_notificacion": "string",
  "mensaje": "string"
}
```

## Configuración

### Variables de Entorno

```env
ORCHESTRATOR_PORT=3002
CAMUNDA_URL=http://camunda:8080/engine-rest
BACKEND_URL=http://backend:3001
NODE_ENV=production
ORCHESTRATOR_TOKEN=dev-orchestrator-token
```

> El mismo valor de `ORCHESTRATOR_TOKEN` debe configurarse en el backend (`ORCHESTRATOR_TOKEN`) para que las llamadas internas del orchestrator sean aceptadas.

## Desarrollo

### Instalar dependencias
```bash
npm install
```

### Modo desarrollo
```bash
npm run dev
```

### Compilar
```bash
npm run build
```

### Iniciar producción
```bash
npm start
```

## Docker

### Construir imagen
```bash
docker build -t sgst-orchestrator .
```

### Ejecutar contenedor
```bash
docker run -p 3002:3002 \
  -e CAMUNDA_URL=http://localhost:8081/engine-rest \
  -e BACKEND_URL=http://localhost:3001 \
  sgst-orchestrator
```

## Health Check

El orquestador expone un endpoint de health check:

```bash
GET http://localhost:3002/health
```

## Agregar Nuevos Handlers

Para agregar un nuevo topic handler:

1. Define el tema en el proceso BPMN
2. Agrega el handler en `src/index.ts`:

```typescript
client.subscribe('tu-topic', async ({ task, taskService }) => {
  try {
    // Tu lógica aquí
    await taskService.complete(task);
  } catch (error) {
    await taskService.handleBpmnError(task, 'ERROR_CODE', error.message, {});
  }
});
```

## Logging

El orquestador usa Winston para logging. Los logs incluyen:
- ✅ Operaciones exitosas
- ❌ Errores y excepciones
- 📤 Llamadas al backend
- 📥 Tareas recibidas de Camunda

