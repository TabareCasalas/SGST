# Funcionalidades Implementadas - Sistema SGST

**Sistema de Gestión de Servicios de Trabajo Social**

**Fecha de actualización:** Enero 2025

---

## Índice

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Autenticación y Autorización](#autenticación-y-autorización)
3. [Gestión de Usuarios](#gestión-de-usuarios)
4. [Gestión de Consultantes](#gestión-de-consultantes)
5. [Gestión de Grupos](#gestión-de-grupos)
6. [Gestión de Fichas](#gestión-de-fichas)
7. [Gestión de Trámites](#gestión-de-trámites)
8. [Integración con Camunda](#integración-con-camunda)
9. [Notificaciones](#notificaciones)
10. [Auditoría](#auditoría)
11. [Documentos y Archivos](#documentos-y-archivos)
12. [Reportes](#reportes)
13. [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)

---

## Arquitectura del Sistema

### Componentes Principales

1. **Frontend (React + TypeScript + Vite)**
   - Puerto: 80
   - Framework: React 19.1.0
   - Build tool: Vite
   - Estado: Context API para autenticación y notificaciones

2. **Backend API (Node.js + Express + TypeScript)**
   - Puerto: 3001
   - ORM: Prisma
   - Base de datos: PostgreSQL (sgst_db)
   - Autenticación: JWT (JSON Web Tokens)

3. **Orchestrator (Node.js + TypeScript)**
   - Puerto: 3002
   - Función: Intermediario entre Camunda y Backend
   - Cliente: Zeebe Node.js Client

4. **Camunda 8 (Zeebe)**
   - Puerto: 26500 (Zeebe Gateway)
   - Base de datos: PostgreSQL (camunda_db)
   - Función: Motor de procesos BPMN

5. **PostgreSQL**
   - Puerto: 5432
   - Bases de datos:
     - `sgst_db`: Datos de la aplicación
     - `camunda_db`: Datos de procesos BPMN

### Flujo de Comunicación

```
Frontend → Backend → Orchestrator → Zeebe → Job Workers → Backend → Base de Datos
```

---

## Autenticación y Autorización

### Funcionalidades Implementadas

1. **Sistema de Login**
   - Autenticación mediante email/CI y contraseña
   - Generación de tokens JWT (access token y refresh token)
   - Almacenamiento seguro de tokens en localStorage
   - Renovación automática de tokens

2. **Roles del Sistema**
   - **Estudiante**: Acceso básico a trámites y grupos
   - **Docente**: Gestión de grupos y trámites
   - **Consultante**: Visualización de sus propios trámites
   - **Administrador**: Acceso completo con 3 niveles:
     - Nivel 1 (Administrativo): Gestión de fichas y aprobaciones
     - Nivel 2 (Docente): Gestión de trámites y grupos
     - Nivel 3 (Sistema): Gestión completa de usuarios y sistema

3. **Middleware de Autenticación**
   - Validación de tokens JWT en todas las rutas protegidas
   - Soporte para peticiones del orchestrator mediante token especial
   - Validación de roles y permisos por endpoint

---

## Gestión de Usuarios

### Funcionalidades Implementadas

1. **CRUD Completo de Usuarios**
   - Crear usuarios (solo administradores)
   - Listar usuarios con filtros y búsqueda
   - Editar usuarios
   - Desactivar/activar usuarios
   - Asignar roles y niveles de acceso

2. **Campos de Usuario**
   - Nombre completo
   - Cédula de identidad (CI) - único
   - Domicilio
   - Teléfono
   - Correo electrónico - único
   - Rol (estudiante, docente, consultante, administrador)
   - Nivel de acceso (para administradores)
   - Semestre (para estudiantes)
   - Estado activo/inactivo

3. **Validaciones**
   - CI único en el sistema
   - Email único en el sistema
   - Validación de formato de email
   - Validación de roles válidos

---

## Gestión de Consultantes

### Funcionalidades Implementadas

1. **CRUD Completo de Consultantes**
   - Crear consultantes (vinculados a usuarios)
   - Listar consultantes con búsqueda
   - Editar información de consultantes
   - Ver historial de trámites y fichas

2. **Campos de Consultante**
   - Usuario asociado (relación 1:1)
   - Estado civil
   - Número de padrón - único

3. **Relaciones**
   - Un consultante puede tener múltiples trámites
   - Un consultante puede tener múltiples fichas

---

## Gestión de Grupos

### Funcionalidades Implementadas

1. **CRUD Completo de Grupos**
   - Crear grupos (docentes y administradores)
   - Listar grupos con filtros
   - Editar grupos
   - Activar/desactivar grupos

2. **Campos de Grupo**
   - Nombre del grupo
   - Descripción
   - Estado activo/inactivo

3. **Gestión de Miembros**
   - Agregar estudiantes a grupos
   - Asignar roles en el grupo (responsable, asistente, estudiante)
   - Remover miembros de grupos
   - Ver miembros de un grupo

4. **Permisos**
   - Docentes pueden ver y gestionar sus propios grupos
   - Administradores pueden ver y gestionar todos los grupos
   - Estudiantes pueden ver los grupos a los que pertenecen

---

## Gestión de Fichas

### Funcionalidades Implementadas

1. **CRUD Completo de Fichas**
   - Crear fichas (administradores nivel 1)
   - Listar fichas con filtros avanzados
   - Editar fichas
   - Aprobar fichas pendientes (administradores)
   - Rechazar fichas con motivo

2. **Estados de Ficha**
   - **pendiente**: Ficha creada, esperando aprobación
   - **aprobado**: Ficha aprobada, lista para asignar
   - **standby**: Ficha en espera de asignación a grupo
   - **asignada**: Ficha asignada a un grupo
   - **iniciada**: Trámite iniciado desde la ficha

3. **Campos de Ficha**
   - Consultante asociado
   - Fecha de cita
   - Hora de cita (formato HH:mm)
   - Tema de consulta
   - Docente asignado
   - Número de consulta (formato xx/yyyy) - único
   - Estado
   - Grupo asignado (opcional)
   - Observaciones
   - Process instance ID (para integración con Camunda)

4. **Flujo de Trabajo**
   - Administrador crea ficha → Estado: pendiente
   - Administrador aprueba → Estado: aprobado
   - Docente asigna a grupo → Estado: asignada
   - Docente inicia trámite → Estado: iniciada

---

## Gestión de Trámites

### Funcionalidades Implementadas

1. **CRUD Completo de Trámites**
   - Crear trámites (desde fichas o directamente)
   - Listar trámites con filtros avanzados
   - Ver detalles completos de trámites
   - Editar observaciones
   - Cambiar estado de trámites

2. **Estados de Trámite**
   - **en_tramite**: Trámite activo en proceso
   - **finalizado**: Trámite completado
   - **pendiente**: Trámite en espera (falta información)
   - **desistido**: Trámite abandonado por el consultante

3. **Transiciones de Estado Permitidas**
   - `pendiente` → `en_tramite`, `desistido`
   - `en_tramite` → `finalizado`, `pendiente`, `desistido`
   - `finalizado` → `en_tramite`, `desistido` (reanudación)
   - `desistido` → `en_tramite` (reactivación)

4. **Campos de Trámite**
   - Consultante asociado
   - Grupo asignado
   - Número de carpeta (formato xxx/yy) - único
   - Estado actual
   - Observaciones
   - Fecha de inicio
   - Fecha de cierre (opcional)
   - Motivo de cierre (requerido para desistido/pendiente)
   - Process instance ID (para integración con Camunda)

5. **Funcionalidades Adicionales**
   - Cambio de estado con validación de transiciones
   - Validación de motivo para ciertos cambios de estado
   - Historial de cambios de estado
   - Integración completa con Camunda para orquestación

---

## Integración con Camunda

### Arquitectura de Integración

1. **Orchestrator Service**
   - Servicio intermediario entre Backend y Camunda Zeebe
   - Maneja la comunicación asíncrona
   - Procesa job workers de Zeebe

2. **Proceso BPMN: procesoTramiteGrupos**
   - **Proceso Principal**: `procesoTramiteGrupos`
   - **Subproceso**: `Proceso_Gestion_Grupo`
   - **Versión actual**: 3

3. **Eventos de Mensaje Implementados**
   - `inicio_tramite_grupo`: Inicia un nuevo proceso de trámite
   - `to_pendiente`: Cambia estado a pendiente
   - `to_finalizado`: Cambia estado a finalizado
   - `to_desistido`: Cambia estado a desistido
   - `to_en_tramite`: Reanuda trámite a en_tramite
   - `cerrar_tramite`: Cierra definitivamente el trámite
   - `actualizar_hoja_ruta`: Actualiza hoja de ruta
   - `subir_archivo`: Sube documentos al trámite

4. **Job Workers Implementados**
   - **crear-tramite**: Crea un trámite en el backend
   - **actualizar-estado**: Actualiza el estado de un trámite
   - **enviar-notificacion**: Envía notificaciones automáticas

5. **Boundary Events**
   - Eventos de límite en el call activity para interrumpir el proceso
   - Permiten cambiar el estado del trámite en cualquier momento
   - Configurados con `correlationKey="=businessKey"`

6. **Correlación de Mensajes**
   - Uso de `businessKey` como correlationKey
   - Formato: `tramite:${num_carpeta}`
   - Permite correlacionar mensajes con instancias de proceso

7. **Optimizaciones de Rendimiento**
   - Poll interval: 500ms (consultas cada 500ms)
   - Max jobs to activate: 10 (procesamiento paralelo)
   - Timeouts reducidos: 5 segundos para llamadas HTTP
   - TimeToLive de mensajes: 30 segundos

---

## Notificaciones

### Funcionalidades Implementadas

1. **Sistema de Notificaciones**
   - Notificaciones en tiempo real
   - Badge con contador de no leídas
   - Panel de notificaciones desplegable
   - Marcar como leídas individual o masivamente

2. **Tipos de Notificaciones**
   - **info**: Información general
   - **success**: Operación exitosa
   - **warning**: Advertencia
   - **error**: Error o problema

3. **Eventos que Generan Notificaciones**
   - Cambio de estado de trámite
   - Asignación de ficha a grupo
   - Aprobación/rechazo de ficha
   - Nueva actuación en hoja de ruta
   - Subida de documentos
   - Inicio de trámite

4. **Destinatarios**
   - Miembros del grupo (para cambios de estado)
   - Docente asignado (para fichas)
   - Consultante (para actualizaciones de su trámite)
   - Usuario específico (notificaciones personalizadas)

---

## Auditoría

### Funcionalidades Implementadas

1. **Registro Automático de Acciones**
   - Todas las acciones importantes se registran automáticamente
   - Captura de IP address
   - Timestamp de cada acción
   - Usuario que realizó la acción

2. **Tipos de Entidades Auditadas**
   - Usuarios
   - Trámites
   - Grupos
   - Fichas
   - Consultantes

3. **Acciones Registradas**
   - Crear
   - Modificar
   - Eliminar
   - Desactivar/Activar
   - Cambio de estado
   - Aprobación/Rechazo

4. **Visualización**
   - Lista completa de auditorías
   - Filtros por tipo de entidad
   - Filtros por usuario
   - Filtros por fecha
   - Detalles completos de cada acción

---

## Documentos y Archivos

### Funcionalidades Implementadas

1. **Gestión de Documentos Adjuntos**
   - Subir documentos a trámites
   - Múltiples formatos soportados (PDF, imágenes, documentos)
   - Validación de tipo MIME
   - Validación de tamaño máximo

2. **Información de Documentos**
   - Nombre original del archivo
   - Nombre almacenado (único)
   - Ruta de almacenamiento
   - Tipo MIME
   - Tamaño en bytes
   - Descripción opcional
   - Usuario que subió el documento
   - Fecha de subida

3. **Visualización**
   - Lista de documentos por trámite
   - Descarga de documentos
   - Vista previa (según tipo)
   - Eliminación de documentos (con permisos)

4. **Almacenamiento**
   - Archivos almacenados en `backend/uploads/`
   - Nombres únicos generados automáticamente
   - Relación con trámites y usuarios

---

## Hoja de Ruta

### Funcionalidades Implementadas

1. **Gestión de Actuaciones**
   - Crear actuaciones en trámites
   - Registrar fecha y descripción de actuación
   - Asociar actuación a estudiante
   - Ver historial completo de actuaciones

2. **Campos de Hoja de Ruta**
   - Trámite asociado
   - Usuario (estudiante) que realizó la actuación
   - Fecha de actuación
   - Descripción detallada de la actuación

3. **Visualización**
   - Lista cronológica de actuaciones
   - Filtros por trámite
   - Filtros por usuario
   - Ordenamiento por fecha (más reciente primero)

4. **Notificaciones**
   - Notificación automática a miembros del grupo cuando se agrega una actuación

---

## Reportes

### Funcionalidades Implementadas

1. **Panel de Reportes**
   - Estadísticas generales del sistema
   - Gráficos y visualizaciones
   - Filtros por fecha y tipo

2. **Métricas Disponibles**
   - Total de trámites por estado
   - Trámites por grupo
   - Trámites por consultante
   - Actuaciones por período
   - Documentos subidos
   - Notificaciones enviadas

---

## Optimizaciones de Rendimiento

### Optimizaciones Implementadas

1. **Job Workers**
   - Poll interval reducido a 500ms
   - Procesamiento paralelo (hasta 10 jobs simultáneos)
   - Timeouts optimizados (5 segundos)

2. **Comunicación HTTP**
   - Timeouts reducidos en llamadas entre servicios
   - Reintentos automáticos configurados
   - Manejo eficiente de errores

3. **Base de Datos**
   - Índices en campos frecuentemente consultados
   - Consultas optimizadas con Prisma
   - Relaciones eficientes entre entidades

4. **Frontend**
   - Componentes optimizados con React
   - Lazy loading donde es apropiado
   - Gestión eficiente del estado

---

## Scripts y Utilidades

### Scripts Disponibles

1. **deploy-bpmn.js**
   - Despliega el diagrama BPMN en Camunda Zeebe
   - Verifica que el archivo existe
   - Muestra información de procesos desplegados
   - Uso: `node scripts/deploy-bpmn.js`

2. **Migraciones**
   - `migrate-tramite-estados.js`: Migración de estados de trámites
   - `migrate-roles.js`: Migración de roles de usuarios
   - `migrate-nivel-acceso.js`: Migración de niveles de acceso

---

## Seguridad

### Medidas de Seguridad Implementadas

1. **Autenticación**
   - Tokens JWT con expiración
   - Refresh tokens para renovación
   - Validación de tokens en cada petición

2. **Autorización**
   - Validación de roles por endpoint
   - Middleware de autenticación
   - Validación de permisos específicos

3. **Comunicación Interna**
   - Token especial para comunicación orchestrator-backend
   - Validación de origen de peticiones
   - Headers de seguridad

4. **Base de Datos**
   - Contraseñas hasheadas con bcrypt
   - Validación de datos de entrada
   - Protección contra SQL injection (Prisma)

---

## Estado Actual del Sistema

### Funcionalidades Completamente Implementadas ✅

- ✅ Autenticación y autorización completa
- ✅ Gestión completa de usuarios
- ✅ Gestión completa de consultantes
- ✅ Gestión completa de grupos
- ✅ Gestión completa de fichas
- ✅ Gestión completa de trámites
- ✅ Integración completa con Camunda
- ✅ Sistema de notificaciones
- ✅ Sistema de auditoría
- ✅ Gestión de documentos
- ✅ Hoja de ruta
- ✅ Reportes básicos
- ✅ Cambio de estado de trámites con Camunda
- ✅ Optimizaciones de rendimiento

### Funcionalidades en Desarrollo 🚧

- 🚧 Reportes avanzados con gráficos
- 🚧 Exportación de datos
- 🚧 Búsqueda avanzada
- 🚧 Filtros más complejos

---

## Notas Técnicas

### Tecnologías Utilizadas

- **Frontend**: React 19.1.0, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Orchestrator**: Node.js, TypeScript, Zeebe Node.js Client
- **BPMN**: Camunda 8 (Zeebe)
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT
- **Contenedores**: Docker, Docker Compose

### Configuración de Entorno

- Variables de entorno configuradas en `.env`
- Docker Compose para orquestación de servicios
- Scripts de desarrollo y producción
- Configuración separada para desarrollo y producción

---

## Próximos Pasos Sugeridos

1. Implementar reportes avanzados con gráficos
2. Agregar exportación de datos (PDF, Excel)
3. Mejorar búsqueda y filtros
4. Implementar caché para consultas frecuentes
5. Agregar tests automatizados
6. Mejorar documentación de API
7. Implementar métricas y monitoreo

---

**Documento generado automáticamente - Sistema SGST**
**Última actualización: Enero 2025**


