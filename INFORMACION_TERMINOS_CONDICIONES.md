# Información del Sistema SGST para Términos y Condiciones

**Sistema de Gestión de Servicios de Trabajo Social (SGST)**

---

## 1. DESCRIPCIÓN DEL SISTEMA

### 1.1 Propósito
El Sistema SGST es una plataforma web diseñada para gestionar servicios de trabajo social, específicamente para:
- Gestionar trámites y consultas de consultantes
- Administrar grupos de trabajo de estudiantes y docentes
- Coordinar fichas de consulta y asignaciones
- Registrar actuaciones y documentación relacionada con trámites
- Generar reportes y estadísticas del sistema

### 1.2 Arquitectura Técnica
- **Frontend**: Aplicación web React con TypeScript
- **Backend**: API REST con Node.js, Express y TypeScript
- **Base de Datos**: PostgreSQL (dos bases de datos separadas: aplicación y procesos BPMN)
- **Motor de Procesos**: Camunda 8 (Zeebe) para orquestación de flujos de trabajo
- **Autenticación**: Sistema basado en JWT (JSON Web Tokens)
- **Almacenamiento de Archivos**: Sistema de archivos local en el servidor

---

## 2. DATOS PERSONALES RECOPILADOS

### 2.1 Datos de Usuarios del Sistema
El sistema recopila y almacena los siguientes datos personales de usuarios:

**Datos Obligatorios:**
- Nombre completo
- Cédula de Identidad (CI) - identificador único
- Domicilio (dirección de residencia)
- Teléfono
- Correo electrónico - identificador único
- Contraseña (almacenada de forma encriptada con bcrypt)
- Rol en el sistema (estudiante, docente, consultante, administrador)
- Estado activo/inactivo

**Datos Opcionales según Rol:**
- Semestre (para estudiantes)
- Nivel de acceso (para administradores: nivel 1 administrativo o nivel 3 sistema)

### 2.2 Datos de Consultantes
- Todos los datos del usuario asociado (relación 1:1)
- Estado civil
- Número de padrón (identificador único)

### 2.3 Datos de Trámites
- Consultante asociado
- Grupo de trabajo asignado
- Número de carpeta (formato único: xxx/yy)
- Estado del trámite (en_tramite, finalizado, pendiente, desistido)
- Observaciones y notas
- Fecha de inicio
- Fecha de cierre (opcional)
- Motivo de cierre (cuando aplica)
- Tema de consulta

### 2.4 Datos de Fichas de Consulta
- Consultante asociado
- Fecha y hora de cita
- Tema de consulta
- Docente asignado
- Número de consulta (formato único: xx/yyyy)
- Estado (pendiente, aprobado, standby, asignada, iniciada)
- Grupo asignado (opcional)
- Observaciones

### 2.5 Documentos y Archivos
- Documentos adjuntos a trámites
- Nombre original del archivo
- Tipo MIME del archivo
- Tamaño del archivo
- Descripción opcional
- Usuario que subió el documento
- Fecha de subida

**Formatos soportados:** PDF, imágenes, documentos de oficina
**Tamaño máximo:** 10MB por archivo

### 2.6 Datos de Auditoría
El sistema registra automáticamente:
- Usuario que realizó la acción
- Tipo de entidad afectada
- Acción realizada (crear, modificar, eliminar, cambiar estado, etc.)
- Detalles de la acción
- Dirección IP del usuario
- Timestamp de la acción

### 2.7 Datos de Notificaciones
- Usuario destinatario
- Usuario emisor (si aplica)
- Título y mensaje
- Tipo de notificación (info, success, warning, error)
- Estado de lectura
- Entidad relacionada (trámite, ficha, grupo, etc.)

### 2.8 Datos de Hoja de Ruta
- Trámite asociado
- Usuario (estudiante) que realizó la actuación
- Fecha de actuación
- Descripción detallada de la actuación

---

## 3. TIPOS DE USUARIOS Y ROLES

### 3.1 Estudiante
- Acceso básico a trámites y grupos
- Puede ver los grupos a los que pertenece
- Puede registrar actuaciones en hojas de ruta
- Puede subir documentos a trámites asignados
- Puede ver notificaciones relacionadas con sus grupos

### 3.2 Docente
- Gestión completa de grupos propios
- Asignación de fichas a grupos
- Inicio de trámites desde fichas
- Gestión de trámites asignados a sus grupos
- Visualización de reportes de sus grupos

### 3.3 Consultante
- Visualización de sus propios trámites
- Acceso a información de sus fichas
- Visualización de documentos relacionados con sus trámites
- Recepción de notificaciones sobre sus trámites

### 3.4 Administrador
**Nivel 1 (Administrativo):**
- Gestión de fichas
- Aprobación/rechazo de fichas
- Visualización de trámites

**Nivel 2 (Docente):**
- Todas las funciones de docente
- Gestión de trámites y grupos

**Nivel 3 (Sistema):**
- Acceso completo al sistema
- Gestión de usuarios
- Gestión de consultantes
- Acceso a auditoría completa
- Gestión de reportes
- Configuración del sistema

---

## 4. FUNCIONALIDADES PRINCIPALES

### 4.1 Gestión de Usuarios
- Creación, edición y desactivación de usuarios
- Asignación de roles y permisos
- Importación masiva desde archivos Excel
- Búsqueda y filtrado de usuarios

### 4.2 Gestión de Consultantes
- Registro de consultantes vinculados a usuarios
- Historial de trámites y fichas por consultante
- Búsqueda y consulta de información

### 4.3 Gestión de Grupos
- Creación y administración de grupos de trabajo
- Asignación de miembros (estudiantes, responsables, asistentes)
- Gestión de grupos por docentes

### 4.4 Gestión de Fichas
- Creación de fichas de consulta
- Aprobación/rechazo de fichas
- Asignación de fichas a grupos
- Inicio de trámites desde fichas

### 4.5 Gestión de Trámites
- Creación y seguimiento de trámites
- Cambio de estados con validación de transiciones
- Registro de observaciones
- Cierre de trámites con motivo

### 4.6 Sistema de Notificaciones
- Notificaciones en tiempo real
- Diferentes tipos de notificaciones (info, success, warning, error)
- Notificaciones automáticas por cambios de estado
- Historial de notificaciones

### 4.7 Gestión de Documentos
- Subida de documentos a trámites
- Validación de tipo y tamaño
- Descarga de documentos
- Vista previa de documentos

### 4.8 Hoja de Ruta
- Registro de actuaciones en trámites
- Historial cronológico de actuaciones
- Asociación de actuaciones a estudiantes

### 4.9 Sistema de Auditoría
- Registro automático de todas las acciones importantes
- Filtros por tipo de entidad, usuario y fecha
- Trazabilidad completa de cambios

### 4.10 Reportes
- Estadísticas generales del sistema
- Reportes por grupo, consultante, período
- Métricas de trámites y actuaciones

---

## 5. SEGURIDAD Y PRIVACIDAD

### 5.1 Autenticación
- Sistema de autenticación mediante CI y contraseña
- Contraseñas almacenadas con hash bcrypt (no se almacenan en texto plano)
- Tokens JWT con expiración:
  - Access token: 8 horas
  - Refresh token: 7 días
- Renovación automática de tokens
- Validación de tokens en todas las rutas protegidas

### 5.2 Autorización
- Control de acceso basado en roles
- Validación de permisos por endpoint
- Middleware de autenticación en todas las rutas protegidas
- Separación de permisos por nivel de administrador

### 5.3 Protección de Datos
- Validación de datos de entrada
- Protección contra SQL injection (mediante Prisma ORM)
- Validación de tipos MIME en archivos subidos
- Límites de tamaño de archivo (10MB)
- Validación de formatos de email y datos únicos

### 5.4 Comunicación Interna
- Token especial para comunicación entre servicios (orchestrator-backend)
- Validación de origen de peticiones
- Headers de seguridad configurados

### 5.5 Registro de Acciones
- Todas las acciones importantes se registran en auditoría
- Captura de IP address para trazabilidad
- Registro de usuario, acción y detalles

---

## 6. ALMACENAMIENTO Y RETENCIÓN DE DATOS

### 6.1 Ubicación de Datos
- Base de datos PostgreSQL en servidor
- Archivos almacenados en sistema de archivos del servidor (`backend/uploads/`)
- Dos bases de datos separadas:
  - `sgst_db`: Datos de la aplicación
  - `camunda_db`: Datos de procesos BPMN

### 6.2 Retención
- Los datos se almacenan de forma permanente mientras el usuario esté activo
- Los usuarios pueden ser desactivados (no eliminados)
- Los documentos se mantienen asociados a trámites
- La auditoría se mantiene de forma permanente para trazabilidad

### 6.3 Backup
- Se recomienda realizar backups periódicos de la base de datos
- Los archivos subidos deben incluirse en los backups

---

## 7. SERVICIOS EXTERNOS Y TECNOLOGÍAS

### 7.1 Tecnologías Utilizadas
- **Frontend**: React 19.1.0, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Motor de Procesos**: Camunda 8 (Zeebe) - motor de procesos BPMN
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Contenedores**: Docker, Docker Compose

### 7.2 Integración con Camunda
- El sistema utiliza Camunda 8 (Zeebe) para orquestar procesos de negocio
- Los trámites están vinculados a instancias de proceso en Camunda
- Comunicación asíncrona mediante job workers
- Eventos de mensaje para cambios de estado

### 7.3 Servicios de Terceros
- No se identifican servicios de terceros externos para almacenamiento de datos
- El sistema opera de forma autónoma en infraestructura propia

---

## 8. RESPONSABILIDADES Y LIMITACIONES

### 8.1 Responsabilidades del Usuario
- Mantener la confidencialidad de sus credenciales de acceso
- Notificar inmediatamente cualquier uso no autorizado de su cuenta
- Usar el sistema únicamente para los fines autorizados
- No compartir credenciales con terceros
- Proporcionar información veraz y actualizada

### 8.2 Responsabilidades del Administrador del Sistema
- Mantener la seguridad del sistema
- Realizar backups periódicos
- Gestionar usuarios y permisos adecuadamente
- Monitorear el uso del sistema
- Responder a incidentes de seguridad

### 8.3 Limitaciones del Sistema
- El sistema es una herramienta de gestión, no reemplaza el juicio profesional
- Los reportes y estadísticas son informativos
- El sistema depende de la información proporcionada por los usuarios
- La disponibilidad del sistema puede verse afectada por mantenimientos o actualizaciones

### 8.4 Uso Aceptable
- El sistema debe usarse únicamente para fines relacionados con servicios de trabajo social
- No se permite el uso del sistema para actividades ilegales o no autorizadas
- No se permite intentar acceder a datos o funcionalidades no autorizadas
- No se permite la manipulación o alteración maliciosa de datos

---

## 9. ACCESO Y MODIFICACIÓN DE DATOS

### 9.1 Acceso a Datos Propios
- Los usuarios pueden acceder a sus propios datos a través de su perfil
- Los consultantes pueden ver sus propios trámites y fichas
- Los estudiantes pueden ver los grupos a los que pertenecen

### 9.2 Modificación de Datos
- Los usuarios pueden solicitar la modificación de sus datos personales
- Los administradores pueden modificar datos de usuarios según su nivel de acceso
- Todos los cambios quedan registrados en auditoría

### 9.3 Eliminación de Datos
- Los usuarios pueden ser desactivados (no eliminados físicamente)
- Los datos se mantienen para mantener la integridad de trámites y auditoría
- La eliminación física de datos requiere autorización especial

---

## 10. NOTIFICACIONES Y COMUNICACIONES

### 10.1 Notificaciones del Sistema
- El sistema genera notificaciones automáticas para:
  - Cambios de estado de trámites
  - Asignación de fichas a grupos
  - Aprobación/rechazo de fichas
  - Nueva actuación en hoja de ruta
  - Subida de documentos
  - Inicio de trámites

### 10.2 Comunicaciones
- Las notificaciones se muestran dentro del sistema
- Los usuarios pueden marcar notificaciones como leídas
- No se identifican comunicaciones externas (email, SMS) en el código actual

---

## 11. CUMPLIMIENTO LEGAL

### 11.1 Protección de Datos Personales
- El sistema maneja datos personales sensibles (CI, domicilio, teléfono, email)
- Se requiere cumplimiento con normativas de protección de datos personales
- Los datos de consultantes pueden incluir información sensible sobre su situación

### 11.2 Registro de Acciones
- El sistema mantiene un registro completo de auditoría
- Las direcciones IP se registran para trazabilidad
- Todos los cambios importantes quedan documentados

---

## 12. ACTUALIZACIONES Y CAMBIOS

### 12.1 Actualizaciones del Sistema
- El sistema puede recibir actualizaciones periódicas
- Las actualizaciones pueden incluir nuevas funcionalidades o correcciones
- Los usuarios serán notificados de cambios significativos

### 12.2 Cambios en Términos y Condiciones
- Los términos y condiciones pueden ser actualizados
- Se recomienda notificar a los usuarios de cambios importantes
- El uso continuado del sistema implica aceptación de los términos actualizados

---

## 13. CONTACTO Y SOPORTE

### 13.1 Soporte Técnico
- Los administradores del sistema proporcionan soporte técnico
- Los problemas deben reportarse a través de los canales establecidos

### 13.2 Consultas sobre Privacidad
- Las consultas sobre privacidad y manejo de datos deben dirigirse a los administradores
- Los usuarios pueden solicitar información sobre sus datos personales

---

## 14. INFORMACIÓN ADICIONAL RELEVANTE

### 14.1 Flujo de Trabajo
- El sistema utiliza procesos BPMN para orquestar flujos de trabajo complejos
- Los trámites siguen un flujo definido con estados y transiciones válidas
- Las fichas pasan por un proceso de aprobación antes de ser asignadas

### 14.2 Integridad de Datos
- El sistema valida la integridad referencial de los datos
- Las relaciones entre entidades están protegidas (cascadas donde aplica)
- Los identificadores únicos previenen duplicados

### 14.3 Rendimiento
- El sistema está optimizado para procesamiento paralelo
- Se utilizan índices en la base de datos para mejorar el rendimiento
- Los job workers procesan tareas de forma asíncrona

---

## 15. PUNTOS CLAVE PARA TÉRMINOS Y CONDICIONES

### 15.1 Aspectos Críticos a Incluir
1. **Consentimiento para procesamiento de datos personales**
2. **Responsabilidad del usuario por mantener credenciales seguras**
3. **Uso aceptable del sistema**
4. **Limitaciones de responsabilidad del proveedor**
5. **Derechos de acceso y modificación de datos personales**
6. **Retención de datos y auditoría**
7. **Confidencialidad de información de consultantes**
8. **Prohibición de uso no autorizado o malicioso**
9. **Notificación de cambios en términos y condiciones**
10. **Procedimientos para reportar problemas o incidentes**

### 15.2 Consideraciones Especiales
- El sistema maneja información sensible de consultantes que puede incluir situaciones personales delicadas
- Los estudiantes tienen acceso a información de consultantes como parte de su formación
- Los docentes y administradores tienen responsabilidades adicionales de confidencialidad
- El sistema registra todas las acciones para auditoría y trazabilidad
- Los datos se mantienen incluso después de desactivar usuarios para mantener integridad histórica

---

**Documento generado para facilitar la creación de Términos y Condiciones del Sistema SGST**
**Fecha: Enero 2025**


