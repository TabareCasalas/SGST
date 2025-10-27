# 🔗 Guía de Integración Frontend-Backend-Camunda

Este documento explica cómo funciona el flujo completo de integración entre el Frontend, Backend, Orchestrator y Camunda.

## 🎯 Flujo Completo

```
1. Usuario → Frontend (React)          : Crea formulario de trámite
2. Frontend → Backend API              : POST /api/tramites
3. Backend → PostgreSQL                : Guarda el trámite
4. Backend → Orchestrator              : POST /api/procesos/iniciar
5. Orchestrator → Camunda              : Inicia proceso BPMN
6. Camunda → Orchestrator              : Asigna external tasks
7. Orchestrator → Backend              : Ejecuta acciones
8. Backend → PostgreSQL                : Actualiza datos
9. Frontend → Backend                  : GET /api/tramites (muestra estado)
```

## 📁 Archivos Creados

### Frontend

#### 1. **Tipos TypeScript** (`frontend/src/types/tramite.ts`)
Define las interfaces de TypeScript para toda la aplicación:
- `Tramite`
- `Consultante`
- `Usuario`
- `Grupo`
- `Notificacion`
- `CreateTramiteDTO`

#### 2. **Servicio API** (`frontend/src/services/api.ts`)
Clase `ApiService` que centraliza todas las llamadas al backend:
- `getTramites()` - Listar trámites
- `getTramiteById()` - Obtener un trámite
- `createTramite()` - Crear trámite (inicia proceso en Camunda)
- `updateTramite()` - Actualizar trámite
- `deleteTramite()` - Eliminar trámite
- `getUsuarios()`, `getConsultantes()`, `getGrupos()` - Entidades auxiliares

#### 3. **Componente Lista** (`frontend/src/components/TramitesList.tsx`)
- Muestra todos los trámites en una grilla
- Muestra estado con colores
- Permite eliminar trámites
- Botón de actualizar

#### 4. **Componente Formulario** (`frontend/src/components/CreateTramiteForm.tsx`)
- Formulario para crear nuevos trámites
- Dropdown de consultantes
- Dropdown de grupos
- Campo numérico para número de carpeta
- Campo de texto para observaciones
- Manejo de errores y mensajes de éxito

#### 5. **App Principal** (`frontend/src/App.tsx`)
- Interfaz principal con navegación
- Alterna entre vista de lista y formulario
- Footer con links a servicios

## 🚀 Cómo Usar

### 1. Asegurar que los servicios estén corriendo

```powershell
docker-compose ps
```

Todos deben estar "Up" y "healthy".

### 2. Acceder al Frontend

Abre: **http://localhost:3000**

### 3. Crear un Trámite

1. Clic en **"➕ Crear Trámite"**
2. Selecciona un **Consultante** del dropdown
3. Selecciona un **Grupo** del dropdown
4. Ingresa un **Número de Carpeta** (único)
5. (Opcional) Agrega **Observaciones**
6. Clic en **"📝 Crear Trámite"**

### 4. Qué Sucede Internamente

Cuando creas un trámite:

1. **Frontend envía POST** a `http://localhost:3001/api/tramites`
   ```json
   {
     "id_consultante": 1,
     "id_grupo": 1,
     "num_carpeta": 12345,
     "observaciones": "Trámite de prueba"
   }
   ```

2. **Backend** recibe la petición:
   - Valida los datos
   - Verifica que el consultante y grupo existen
   - Guarda el trámite en PostgreSQL
   - Devuelve el trámite guardado

3. **Backend llama al Orchestrator**:
   - Envía POST a `http://localhost:3002/api/procesos/iniciar`
   - Con datos del trámite creado

4. **Orchestrator inicia proceso en Camunda**:
   - Llama a Camunda API (`http://camunda:8080/engine-rest`)
   - Inicia el proceso BPMN `procesoTramite`
   - Recibe el `process_instance_id`

5. **Backend actualiza el trámite**:
   - Guarda el `process_instance_id` en la BD
   - Ahora el trámite está vinculado con el proceso de Camunda

6. **Camunda ejecuta External Tasks**:
   - El orchestrator consulta cada 5 segundos
   - Ejecuta las tareas definidas en el BPMN
   - Notifica cambios al backend

7. **Frontend muestra el resultado**:
   - Regresa a la vista de lista
   - Muestra el nuevo trámite con su proceso activo

### 5. Ver Trámites

- Clic en **"👁️ Ver Trámites"**
- Se muestran todos los trámites en tarjetas
- Cada tarjeta muestra:
  - Número de carpeta
  - Estado (con colores)
  - Consultante
  - Grupo
  - Fecha de inicio
  - ID del proceso de Camunda

### 6. Filtrar por Estado

Puedes filtrar los trámites agregando parámetros a la URL:
```
http://localhost:3000/?estado=en_revision
```

Estados disponibles:
- `iniciado` (azul)
- `en_revision` (naranja)
- `aprobado` (verde)
- `rechazado` (rojo)
- `finalizado` (gris)

## 🎨 Estados Visuales

Cada trámite muestra su estado con un badge de color:
- 🔵 **Iniciado** - Estado inicial
- 🟠 **En Revisión** - Proceso en curso
- 🟢 **Aprobado** - Aprobado
- 🔴 **Rechazado** - Rechazado
- ⚫ **Finalizado** - Terminado

## 📊 Endpoints Disponibles

### Backend API (`http://localhost:3001`)

#### Trámites
```
GET    /api/tramites              # Listar todos
GET    /api/tramites/:id          # Obtener uno
POST   /api/tramites               # Crear (inicia proceso Camunda)
PATCH  /api/tramites/:id          # Actualizar
DELETE /api/tramites/:id          # Eliminar
GET    /api/tramites/stats        # Estadísticas
POST   /api/tramites/notificar    # Enviar notificación
```

#### Usuarios
```
GET    /api/usuarios               # Listar todos
GET    /api/usuarios/:id          # Obtener uno
POST   /api/usuarios               # Crear
PATCH  /api/usuarios/:id          # Actualizar
```

#### Consultantes
```
GET    /api/consultantes           # Listar todos
GET    /api/consultantes/:id      # Obtener uno
POST   /api/consultantes           # Crear
PATCH  /api/consultantes/:id      # Actualizar
```

#### Grupos
```
GET    /api/grupos                 # Listar todos
GET    /api/grupos/:id            # Obtener uno
POST   /api/grupos                 # Crear
PATCH  /api/grupos/:id            # Actualizar
```

### Orchestrator (`http://localhost:3002`)

```
POST   /api/procesos/iniciar       # Iniciar proceso en Camunda
GET    /api/procesos/:instanceId   # Obtener instancia
GET    /health                     # Health check
```

### Camunda (`http://localhost:8081`)

```
GET    /engine-rest/engine        # Info del motor
POST   /engine-rest/process-definition/key/:key/start  # Iniciar proceso
```

## 🔍 Verificar que Funciona

### 1. Logs del Backend
```powershell
docker-compose logs -f backend
```
Busca: `✅ Trámite creado: X` y `🚀 Proceso iniciado en Camunda`

### 2. Logs del Orchestrator
```powershell
docker-compose logs -f orchestrator
```
Busca: `📋 Encontradas X tareas externas pendientes`

### 3. Ver en Camunda
Abre: http://localhost:8081
- Login: `admin` / `admin`
- Ve a "Processes" → "Running"
- Deberías ver las instancias activas

### 4. Ver en PgAdmin
Abre: http://localhost:8080
- Login: `admin@sgst.com` / `admin123`
- Conecta al servidor
- Ve a `sgst_db` → `public` → `Tramite`
- Verifica que los trámites tienen `process_instance_id`

## 🐛 Solución de Problemas

### Error: "Cannot POST /api/tramites"
- Verifica que el backend esté corriendo: `docker-compose ps backend`
- Revisa los logs: `docker-compose logs backend`

### Error: "Failed to fetch"
- Verifica que la URL del API sea correcta
- En `frontend/src/services/api.ts`, línea 1
- Asegúrate de que sea: `const API_URL = 'http://localhost:3001/api';`

### El trámite se crea pero no inicia proceso en Camunda
- Verifica que el orchestrator esté corriendo
- Revisa los logs: `docker-compose logs orchestrator`
- Puede que Camunda no esté disponible

### Los trámites no se muestran
- Verifica que hay datos en PostgreSQL
- Conecta a PgAdmin y verifica la tabla `Tramite`
- O ejecuta: `docker exec -it sgst_postgres psql -U sgst_user -d sgst_db -c "SELECT * FROM \"Tramite\";"`

## 📝 Próximos Pasos

Para completar el flujo, puedes agregar:

1. **Vista de detalle del trámite**:
   - Ver información completa
   - Ver historial de estados
   - Ver notificaciones

2. **Editar trámites**:
   - Actualizar observaciones
   - Cambiar estado manualmente

3. **Filtros avanzados**:
   - Por estado, fecha, grupo, etc.

4. **Notificaciones en tiempo real**:
   - WebSocket para actualizaciones

5. **Dashboard**:
   - Estadísticas de trámites
   - Gráficos de estado

## 🎓 Ejemplo Completo de Flujo

```
1. Usuario abre http://localhost:3000
2. Clic en "➕ Crear Trámite"
3. Selecciona consultante: "Juan Pérez"
4. Selecciona grupo: "Trámites Notariales"
5. Ingresa número de carpeta: 12345
6. Escribe observaciones: "Trámite de prueba"
7. Clic en "📝 Crear Trámite"
8. ✅ Mensaje de éxito: "Trámite creado exitosamente"
9. Automáticamente se inicia proceso en Camunda
10. El trámite aparece en la lista con estado "iniciado"
11. El badge muestra el color azul (iniciado)
12. Si expandes la tarjeta, verás el process_instance_id
```

---

¿Listo para probar? Abre **http://localhost:3000** y crea tu primer trámite! 🚀

