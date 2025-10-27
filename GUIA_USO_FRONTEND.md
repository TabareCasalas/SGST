# 🎯 Guía de Uso del Frontend con Camunda

## 📋 Funcionalidades Implementadas

El frontend ahora permite interactuar completamente con Camunda desde la interfaz web:

### 1. Crear Trámite ✅
- Formulario completo para crear nuevos trámites
- Al crear, automáticamente inicia proceso en Camunda
- Estado inicial: `iniciado` → cambia a `en_revision`

### 2. Ver Tareas Pendientes ✅
- Botón "🔔 Tareas (X)" muestra solo trámites en revisión
- Cards especiales para tareas que requieren acción
- Badge visual para trámites pendientes

### 3. Completar Tareas (Aprobar/Rechazar) ✅
- Botones "✅ Aprobar" y "❌ Rechazar"
- Al aprobar/rechazar, se completa la User Task en Camunda
- El proceso continúa automáticamente según la decisión

### 4. Visualizar Estado Completo ✅
- Estado del trámite con colores
- ID del proceso de Camunda visible
- Información del consultante y grupo

## 🎨 Interfaz de Usuario

### Vista de Lista Normal
Muestra todos los trámites con sus estados:
- 🔵 Iniciado (azul)
- 🟠 En Revisión (naranja) - Tareas pendientes
- 🟢 Aprobado (verde)
- 🔴 Rechazado (rojo)
- ⚫ Finalizado (gris)

### Vista de Tareas Pendientes
Cuando hay trámites en estado "en_revision":
- Se muestra el botón "🔔 Tareas (X)" 
- Al hacer clic, muestra solo las tareas pendientes
- Cada tarea muestra:
  - Número de carpeta
  - Consultante
  - Grupo
  - Fecha de inicio
  - Botones de acción

## 🔄 Flujo Completo

### Paso 1: Crear Trámite
```
Frontend → Backend → Orchestrator → Camunda
          ↓
      PostgreSQL (estado: "iniciado")
          ↓
      Actualiza estado a "en_revision"
```

### Paso 2: Ver Tareas Pendientes
```
Frontend → Backend
       ↓
  GET /api/tramites?estado=en_revision
       ↓
  Muestra solo trámites en revisión
```

### Paso 3: Completar Tarea (Aprobar/Rechazar)
```
Frontend → Backend → Orchestrator → Camunda
          ↓
   Variable aprobado=true/false
   Variable decision="aprobado"/"rechazado"
          ↓
   Camunda continúa el flujo BPMN
          ↓
   Orchestrator ejecuta External Tasks
          ↓
   Estado se actualiza en PostgreSQL
```

## 🎯 Estados del Trámite

1. **iniciado** - Acaba de crearse
2. **en_revision** - Esperando revisión docente
3. **aprobado** - Aprobado por docente
4. **rechazado** - Rechazado por docente
5. **finalizado** - Proceso completado

## 🚀 Cómo Usar

### Para Estudiantes/Consultantes

1. **Crear Trámite**:
   - Abre http://localhost:3000
   - Clic en "➕ Crear Trámite"
   - Selecciona consultante y grupo
   - Ingresa número de carpeta
   - Clic en "📝 Crear Trámite"

2. **Ver Estado**:
   - El trámite aparece con estado "iniciado"
   - Automáticamente pasa a "en_revision" esperando revisión

### Para Docentes/Revisores

1. **Ver Tareas Pendientes**:
   - Abre http://localhost:3000
   - Aparece el botón "🔔 Tareas (X)" si hay trámites pendientes
   - Clic para ver solo las tareas

2. **Revisar Trámite**:
   - Se muestra una card con la información del trámite
   - Opciones:
     - **✅ Aprobar**: Aprueba el trámite
     - **❌ Rechazar**: Rechaza el trámite

3. **Completar Tarea**:
   - Al hacer clic en Aprobar/Rechazar:
     - Se completa la User Task en Camunda
     - El proceso continúa automáticamente
     - Se envía notificación correspondiente
     - El estado se actualiza en la base de datos

## 🔍 Verificación de Flujo

Después de completar una tarea, puedes verificar:

1. **En el Frontend**: El estado cambia a "aprobado" o "rechazado"
2. **En Camunda**: 
   - Ve a http://localhost:8081
   - Procesos → Running (debería verse el proceso avanzando)
3. **En los Logs**:
   ```powershell
   docker-compose logs orchestrator -f
   ```
   - Verás las external tasks ejecutándose
   - Verás las notificaciones siendo enviadas

## 📝 Notas Importantes

- El estado "en_revision" indica que hay una User Task pendiente
- Los docentes pueden ver y completar estas tareas desde el frontend
- No es necesario acceder directamente a Camunda
- El flujo se completa automáticamente después de la decisión del docente

## 🎉 Funcionalidades Completadas

✅ Frontend interactúa completamente con Camunda
✅ User Tasks se pueden completar desde el frontend
✅ Estados automáticos según el flujo BPMN
✅ Notificaciones automáticas
✅ Visualización intuitiva del estado
✅ Filtrado de tareas pendientes

