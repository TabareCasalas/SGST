# Architecture Decision Records (ADR) - Sistema SGST

## Introducción

Este documento contiene todos los Architecture Decision Records (ADR) del Sistema SGST.

### ¿Qué es un ADR?

Un Architecture Decision Record es un documento que captura una decisión arquitectónica importante junto con su contexto y consecuencias. Los ADRs ayudan a:

- Documentar el "por qué" detrás de las decisiones técnicas
- Facilitar la comunicación entre miembros del equipo
- Proporcionar contexto histórico para futuras decisiones
- Evitar repetir discusiones sobre decisiones ya tomadas

### Formato

Cada ADR sigue el siguiente formato:

- **Título**: Número y nombre descriptivo
- **Estado**: Propuesto, Aceptado, Deprecado, Reemplazado
- **Contexto**: Situación que requiere una decisión
- **Opciones Consideradas**: Alternativas evaluadas
- **Decisión**: Opción elegida
- **Consecuencias**: Impacto positivo y negativo de la decisión

---

## Índice de ADRs

| ADR | Título | Estado |
|-----|--------|--------|
| [ADR-001](#adr-001-uso-de-camunda-8-zeebe-para-orquestación-de-procesos) | Uso de Camunda 8 (Zeebe) para orquestación de procesos | Aceptado |
| [ADR-002](#adr-002-separación-del-orchestrator-como-servicio-independiente) | Separación del Orchestrator como servicio independiente | Aceptado |
| [ADR-003](#adr-003-uso-de-prisma-como-orm) | Uso de Prisma como ORM | Aceptado |
| [ADR-004](#adr-004-arquitectura-de-microservicios-con-docker) | Arquitectura de microservicios con Docker | Aceptado |
| [ADR-005](#adr-005-autenticación-basada-en-jwt) | Autenticación basada en JWT | Aceptado |
| [ADR-006](#adr-006-separación-de-bases-de-datos-sgst_db-y-camunda_db) | Separación de bases de datos (sgst_db y camunda_db) | Aceptado |
| [ADR-007](#adr-007-patrón-de-job-workers-para-comunicación-asíncrona) | Patrón de Job Workers para comunicación asíncrona | Aceptado |
| [ADR-008](#adr-008-frontend-con-react-y-typescript) | Frontend con React y TypeScript | Aceptado |
| [ADR-009](#adr-009-postgresql-como-base-de-datos-principal) | PostgreSQL como base de datos principal | Aceptado |
| [ADR-010](#adr-010-nodejs-y-express-para-el-backend-api) | Node.js y Express para el Backend API | Aceptado |

---

# ADR-001: Uso de Camunda 8 (Zeebe) para orquestación de procesos

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

El Sistema SGST requiere gestionar flujos de trabajo complejos para trámites de trabajo social que involucran:
- Múltiples estados y transiciones (en_tramite, finalizado, pendiente, desistido)
- Validación de transiciones de estado
- Notificaciones automáticas basadas en cambios de estado
- Coordinación entre múltiples actores (estudiantes, docentes, administradores)
- Trazabilidad completa de procesos
- Posibilidad de reanudar procesos interrumpidos

Necesitamos una solución que permita:
1. Modelar procesos de negocio de forma visual (BPMN)
2. Ejecutar procesos de forma confiable y escalable
3. Mantener el estado de los procesos
4. Integrar con nuestro backend Node.js
5. Monitorear y auditar procesos en ejecución

## Opciones Consideradas

### Opción 1: Camunda 8 (Zeebe)
- **Pros**:
  - Motor de procesos BPMN moderno y escalable
  - Arquitectura cloud-native con Zeebe
  - Soporte para procesos de larga duración
  - API gRPC de alto rendimiento
  - Herramientas de monitoreo (Operate, Tasklist)
  - Comunidad activa y documentación completa
  - Modelado visual con BPMN 2.0
  - Soporte para eventos de mensaje y correlación
- **Contras**:
  - Curva de aprendizaje inicial
  - Requiere infraestructura adicional (Elasticsearch)
  - Complejidad operacional

### Opción 2: Camunda 7
- **Pros**:
  - Más maduro y establecido
  - Mayor cantidad de recursos y ejemplos
- **Contras**:
  - Arquitectura más antigua
  - Menos escalable que Zeebe
  - API REST más lenta que gRPC
  - Menos adecuado para cloud-native

### Opción 3: Workflow Engine propio
- **Pros**:
  - Control total sobre la implementación
  - Sin dependencias externas
- **Contras**:
  - Desarrollo y mantenimiento costoso
  - Falta de herramientas de monitoreo
  - Mayor riesgo de bugs
  - Tiempo de desarrollo significativo

### Opción 4: Temporal.io
- **Pros**:
  - Muy escalable
  - Bueno para workflows complejos
- **Contras**:
  - Menos enfoque en BPMN
  - Curva de aprendizaje más pronunciada
  - Menos herramientas de visualización

### Opción 5: Activiti / Flowable
- **Pros**:
  - Open source
  - Basado en BPMN
- **Contras**:
  - Menos activo que Camunda
  - Menor soporte comunitario
  - Documentación menos completa

## Decisión

Se eligió **Camunda 8 (Zeebe)** como motor de orquestación de procesos.

### Razones principales:

1. **Escalabilidad**: Zeebe está diseñado para ser altamente escalable y manejar grandes volúmenes de procesos concurrentes
2. **Rendimiento**: Protocolo gRPC proporciona mejor rendimiento que REST
3. **Modelado Visual**: BPMN 2.0 permite modelar procesos de negocio de forma clara y mantenible
4. **Herramientas**: Operate y Tasklist proporcionan excelentes herramientas de monitoreo y gestión
5. **Comunidad y Soporte**: Camunda tiene una comunidad activa y buen soporte
6. **Cloud-Native**: Arquitectura moderna adecuada para despliegues en contenedores
7. **Eventos y Correlación**: Soporte robusto para eventos de mensaje y correlación de procesos

## Consecuencias

### Positivas

- ✅ Procesos de negocio modelados visualmente y mantenibles
- ✅ Trazabilidad completa de procesos
- ✅ Escalabilidad horizontal del motor de procesos
- ✅ Herramientas de monitoreo integradas
- ✅ Separación clara entre lógica de negocio y orquestación
- ✅ Soporte para procesos de larga duración
- ✅ Capacidad de reanudar procesos interrumpidos
- ✅ Validación de transiciones de estado en el proceso BPMN

### Negativas

- ⚠️ Curva de aprendizaje para el equipo
- ⚠️ Infraestructura adicional requerida (Elasticsearch)
- ⚠️ Complejidad operacional aumentada
- ⚠️ Mayor consumo de recursos (Zeebe + Operate + Tasklist + Elasticsearch)
- ⚠️ Necesidad de mantener diagramas BPMN actualizados

### Mitigaciones

- Documentación completa de procesos BPMN
- Scripts de despliegue automatizados
- Monitoreo y alertas para servicios de Camunda
- Capacitación del equipo en BPMN y Camunda

## Referencias

- [Camunda 8 Documentation](https://docs.camunda.io/)
- [Zeebe Architecture](https://docs.camunda.io/docs/components/zeebe/zeebe-overview/)
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)

---

# ADR-002: Separación del Orchestrator como servicio independiente

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

Necesitamos integrar Camunda Zeebe con nuestro Backend API. Hay varias formas de hacerlo:

1. Integrar directamente el cliente Zeebe en el Backend
2. Crear un servicio separado (Orchestrator) que actúe como intermediario
3. Usar un patrón de cola de mensajes (RabbitMQ, Kafka)

El Backend debe mantenerse enfocado en la lógica de negocio y persistencia, mientras que la integración con Camunda requiere:
- Job Workers que consumen tareas de forma asíncrona
- Manejo de eventos de mensaje
- Correlación de procesos
- Gestión de timeouts y reintentos

## Opciones Consideradas

### Opción 1: Integración directa en Backend
- **Pros**:
  - Menos servicios que mantener
  - Menos latencia (sin llamadas HTTP adicionales)
  - Más simple de desplegar inicialmente
- **Contras**:
  - Acoplamiento fuerte entre Backend y Camunda
  - Difícil escalar independientemente
  - Mezcla de responsabilidades (lógica de negocio + orquestación)
  - Job Workers compiten por recursos con el API
  - Más difícil de testear

### Opción 2: Servicio Orchestrator separado (ELEGIDA)
- **Pros**:
  - Separación clara de responsabilidades
  - Escalabilidad independiente (puede escalarse solo el orchestrator)
  - Backend desacoplado de Camunda
  - Fácil agregar nuevos job workers
  - Testing más simple (mock del orchestrator)
  - Permite múltiples instancias del orchestrator para alta disponibilidad
- **Contras**:
  - Servicio adicional que mantener
  - Latencia adicional por llamadas HTTP
  - Más complejidad operacional

### Opción 3: Cola de mensajes (RabbitMQ/Kafka)
- **Pros**:
  - Desacoplamiento completo
  - Alta escalabilidad
  - Patrón probado
- **Contras**:
  - Infraestructura adicional compleja
  - Overhead de serialización/deserialización
  - Más difícil de debuggear
  - Overkill para nuestro caso de uso

## Decisión

Se eligió crear un **servicio Orchestrator separado** que actúa como intermediario entre Camunda Zeebe y el Backend API.

### Razones principales:

1. **Separación de Responsabilidades**: El Backend se enfoca en lógica de negocio, el Orchestrator en integración con Camunda
2. **Escalabilidad**: El Orchestrator puede escalarse independientemente según la carga de procesos
3. **Desacoplamiento**: El Backend no necesita conocer detalles de Camunda
4. **Mantenibilidad**: Código más organizado y fácil de mantener
5. **Testing**: Más fácil testear cada componente por separado
6. **Flexibilidad**: Fácil agregar nuevos job workers sin tocar el Backend

## Consecuencias

### Positivas

- ✅ Backend enfocado en lógica de negocio
- ✅ Orchestrator puede escalarse independientemente
- ✅ Múltiples instancias del orchestrator pueden consumir jobs en paralelo
- ✅ Fácil agregar nuevos job workers
- ✅ Testing más simple y aislado
- ✅ Backend puede funcionar sin Camunda (para desarrollo local)
- ✅ Separación clara de código

### Negativas

- ⚠️ Servicio adicional que mantener y monitorear
- ⚠️ Latencia adicional por llamadas HTTP entre Orchestrator y Backend
- ⚠️ Más complejidad en el despliegue
- ⚠️ Necesidad de token especial para autenticación interna (x-orchestrator-token)

### Mitigaciones

- Health checks en el Orchestrator
- Timeouts configurados (5 segundos) para evitar esperas largas
- Logging detallado para debugging
- Scripts de despliegue automatizados con Docker Compose
- Documentación clara de la comunicación entre servicios

## Implementación

El Orchestrator:
- Se comunica con Zeebe usando el protocolo gRPC (Zeebe Client)
- Se comunica con el Backend usando HTTP REST
- Usa un token especial (`x-orchestrator-token`) para autenticación interna
- Implementa job workers para:
  - `crear-tramite`: Crea trámites en el backend
  - `actualizar-estado`: Actualiza estados de trámites
  - `enviar-notificacion`: Envía notificaciones automáticas
- Poll interval de 500ms para baja latencia
- Procesa hasta 10 jobs en paralelo

## Referencias

- [Zeebe Node.js Client](https://github.com/camunda/zeebe-client-node-js)
- [External Task Pattern](https://docs.camunda.io/docs/components/concepts/job-workers/)

---

# ADR-003: Uso de Prisma como ORM

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

Necesitamos un ORM (Object-Relational Mapping) para interactuar con PostgreSQL desde nuestro Backend Node.js. Las opciones principales son:

1. Prisma
2. TypeORM
3. Sequelize
4. Knex.js (query builder)
5. SQL directo

Requisitos:
- TypeScript support
- Migraciones de base de datos
- Type safety
- Buen rendimiento
- Facilidad de uso
- Generación de tipos automática

## Opciones Consideradas

### Opción 1: Prisma (ELEGIDA)
- **Pros**:
  - Excelente soporte para TypeScript
  - Generación automática de tipos
  - Migraciones automáticas
  - Query builder intuitivo y type-safe
  - Prisma Studio para visualización de datos
  - Buen rendimiento
  - Documentación excelente
  - Schema declarativo en un solo archivo
  - Validación automática de tipos
- **Contras**:
  - Curva de aprendizaje inicial
  - Menos flexible para queries complejas
  - Requiere regenerar cliente después de cambios

### Opción 2: TypeORM
- **Pros**:
  - Muy popular en la comunidad Node.js
  - Decoradores para definir modelos
  - Soporte para Active Record y Data Mapper
  - Muchos ejemplos disponibles
- **Contras**:
  - Type safety menos robusto que Prisma
  - Decoradores pueden ser confusos
  - Migraciones más manuales
  - Documentación menos clara

### Opción 3: Sequelize
- **Pros**:
  - Muy maduro y estable
  - Gran cantidad de plugins
  - Soporte para múltiples bases de datos
- **Contras**:
  - Principalmente JavaScript (menos TypeScript)
  - Sintaxis más verbosa
  - Menos type safety
  - Menos mantenimiento activo

### Opción 4: Knex.js
- **Pros**:
  - Query builder muy flexible
  - Migraciones integradas
  - Control total sobre queries
- **Contras**:
  - No es un ORM completo
  - Menos type safety
  - Más código boilerplate
  - Sin generación automática de tipos

### Opción 5: SQL directo
- **Pros**:
  - Control total
  - Máximo rendimiento
  - Sin abstracciones
- **Contras**:
  - Sin type safety
  - Mucho código boilerplate
  - Migraciones manuales
  - Mayor riesgo de SQL injection
  - Menos productivo

## Decisión

Se eligió **Prisma** como ORM para el proyecto.

### Razones principales:

1. **Type Safety**: Generación automática de tipos TypeScript desde el schema
2. **Developer Experience**: Sintaxis intuitiva y clara
3. **Migraciones**: Sistema de migraciones automático y robusto
4. **Productividad**: Menos código boilerplate
5. **Documentación**: Excelente documentación y ejemplos
6. **Rendimiento**: Buen rendimiento con queries optimizadas
7. **Herramientas**: Prisma Studio para visualización y debugging
8. **Mantenimiento Activo**: Proyecto muy activo y bien mantenido

## Consecuencias

### Positivas

- ✅ Type safety completo en tiempo de compilación
- ✅ Menos errores en runtime por tipos incorrectos
- ✅ Migraciones automáticas y versionadas
- ✅ Código más limpio y legible
- ✅ Autocompletado en IDE
- ✅ Validación automática de relaciones
- ✅ Prisma Studio para debugging visual
- ✅ Protección contra SQL injection

### Negativas

- ⚠️ Curva de aprendizaje inicial
- ⚠️ Requiere regenerar cliente después de cambios en schema
- ⚠️ Menos flexible para queries muy complejas (aunque permite SQL raw)
- ⚠️ Dependencia de Prisma para migraciones

### Mitigaciones

- Documentación del schema en el código
- Scripts para regenerar cliente automáticamente
- Uso de `$queryRaw` para queries complejas cuando sea necesario
- Revisión de migraciones antes de aplicar

## Implementación

El schema Prisma está en `backend/prisma/schema.prisma` y define:
- 10 modelos principales (Usuario, Consultante, Grupo, Tramite, Ficha, etc.)
- Relaciones entre modelos
- Índices para optimización
- Restricciones de integridad

Las migraciones se gestionan con:
```bash
npx prisma migrate dev
npx prisma generate
```

## Referencias

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma TypeScript Support](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/using-prisma-client-with-typescript)

---

# ADR-004: Arquitectura de microservicios con Docker

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

El sistema SGST tiene múltiples componentes que necesitan:
- Desplegarse de forma consistente
- Comunicarse entre sí
- Escalarse independientemente
- Aislarse unos de otros
- Gestionarse fácilmente en diferentes entornos (desarrollo, producción)

Los componentes principales son:
- Frontend (React)
- Backend API (Node.js)
- Orchestrator (Node.js)
- Camunda Zeebe
- PostgreSQL
- Elasticsearch
- PgAdmin

## Opciones Consideradas

### Opción 1: Docker Compose (ELEGIDA)
- **Pros**:
  - Fácil de configurar y usar
  - Ideal para desarrollo local
  - Orquestación simple de múltiples servicios
  - Networking automático entre contenedores
  - Volúmenes para persistencia
  - Health checks integrados
  - Variables de entorno centralizadas
- **Contras**:
  - No es ideal para producción a gran escala
  - Un solo host (no distribuido)
  - Menos características avanzadas que Kubernetes

### Opción 2: Kubernetes
- **Pros**:
  - Escalabilidad horizontal
  - Auto-scaling
  - Alta disponibilidad
  - Distribuido
  - Ideal para producción a gran escala
- **Contras**:
  - Complejidad significativa
  - Overhead para proyectos pequeños/medianos
  - Curva de aprendizaje pronunciada
  - Requiere infraestructura adicional

### Opción 3: Despliegue manual
- **Pros**:
  - Control total
  - Sin dependencias adicionales
- **Contras**:
  - Difícil de reproducir
  - Propenso a errores
  - Difícil de mantener
  - No escalable

### Opción 4: Servicios gestionados (AWS ECS, Google Cloud Run)
- **Pros**:
  - Gestión simplificada
  - Auto-scaling
  - Alta disponibilidad
- **Contras**:
  - Vendor lock-in
  - Costos adicionales
  - Menos control

## Decisión

Se eligió **Docker Compose** para orquestar los servicios del sistema.

### Razones principales:

1. **Simplicidad**: Fácil de configurar y usar, especialmente para desarrollo
2. **Reproducibilidad**: Entornos consistentes entre desarrollo y producción
3. **Aislamiento**: Cada servicio en su propio contenedor
4. **Networking**: Comunicación automática entre servicios
5. **Volúmenes**: Persistencia de datos fácil de gestionar
6. **Health Checks**: Monitoreo básico integrado
7. **Suficiente para el caso de uso**: El sistema no requiere la complejidad de Kubernetes inicialmente

## Consecuencias

### Positivas

- ✅ Despliegue consistente en todos los entornos
- ✅ Fácil desarrollo local (un solo comando: `docker-compose up`)
- ✅ Aislamiento de servicios
- ✅ Networking automático entre contenedores
- ✅ Volúmenes para persistencia de datos
- ✅ Health checks para monitoreo básico
- ✅ Variables de entorno centralizadas
- ✅ Fácil agregar nuevos servicios

### Negativas

- ⚠️ Limitado a un solo host (no distribuido)
- ⚠️ No tiene auto-scaling automático
- ⚠️ Menos robusto que Kubernetes para alta disponibilidad
- ⚠️ Requiere Docker instalado en el servidor

### Mitigaciones

- Scripts de despliegue para facilitar operaciones
- Documentación clara de despliegue
- Posibilidad de migrar a Kubernetes en el futuro si es necesario
- Health checks para detectar problemas temprano

## Implementación

El `docker-compose.yml` define:
- **Servicios**: frontend, backend, orchestrator, postgres, zeebe, operate, tasklist, identity, elasticsearch, pgadmin
- **Networks**: `sgst_network` (bridge) para comunicación entre servicios
- **Volumes**: Persistencia para postgres, elasticsearch, zeebe, pgadmin
- **Health Checks**: Para todos los servicios críticos
- **Dependencies**: Orden de inicio correcto (postgres antes de backend, etc.)
- **Environment Variables**: Configuración centralizada

## Migración Futura

Si el sistema crece y requiere:
- Escalabilidad horizontal automática
- Alta disponibilidad distribuida
- Auto-scaling basado en carga

Se puede considerar migrar a Kubernetes manteniendo los mismos Dockerfiles.

## Referencias

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

# ADR-005: Autenticación basada en JWT

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

Necesitamos un sistema de autenticación para el Sistema SGST que:
- Permita a usuarios iniciar sesión de forma segura
- Mantenga sesiones entre requests
- Funcione bien con arquitectura de microservicios
- Sea stateless (sin necesidad de sesiones en servidor)
- Permita renovación de tokens
- Sea seguro y resistente a ataques comunes

## Opciones Consideradas

### Opción 1: JWT (JSON Web Tokens) (ELEGIDA)
- **Pros**:
  - Stateless (no requiere almacenamiento en servidor)
  - Funciona bien con microservicios
  - Fácil de implementar
  - Estándar ampliamente adoptado
  - Incluye información del usuario en el token
  - Escalable (no requiere sesiones compartidas)
- **Contras**:
  - Tokens no pueden revocarse fácilmente (sin blacklist)
  - Tamaño del token (puede ser grande si incluye mucha información)
  - Tokens expirados requieren refresh token

### Opción 2: Sessions (cookies + servidor)
- **Pros**:
  - Fácil de revocar (eliminar sesión)
  - Más seguro (tokens no expuestos en localStorage)
  - Control total sobre sesiones
- **Contras**:
  - Requiere almacenamiento en servidor (Redis, base de datos)
  - No funciona bien con microservicios (necesita sesiones compartidas)
  - Más complejo de implementar
  - Problemas con CORS

### Opción 3: OAuth 2.0 / OpenID Connect
- **Pros**:
  - Estándar robusto
  - Delegación de autenticación
  - Soporte para SSO
- **Contras**:
  - Complejidad significativa
  - Overkill para nuestro caso de uso
  - Requiere servidor de autorización separado

### Opción 4: API Keys
- **Pros**:
  - Muy simple
- **Contras**:
  - No adecuado para usuarios finales
  - Sin expiración automática
  - Menos seguro

## Decisión

Se eligió **JWT (JSON Web Tokens)** para autenticación.

### Razones principales:

1. **Stateless**: No requiere almacenamiento de sesiones en servidor
2. **Microservicios**: Funciona perfectamente con arquitectura de microservicios
3. **Simplicidad**: Fácil de implementar y mantener
4. **Escalabilidad**: No requiere sesiones compartidas entre instancias
5. **Estándar**: Ampliamente adoptado y bien documentado
6. **Rendimiento**: Sin consultas a base de datos en cada request

## Consecuencias

### Positivas

- ✅ Stateless: No requiere almacenamiento de sesiones
- ✅ Escalable: Funciona con múltiples instancias del backend
- ✅ Simple: Fácil de implementar y mantener
- ✅ Información en token: Incluye id, CI y rol del usuario
- ✅ Refresh tokens: Permite renovación sin re-login
- ✅ Seguro: Tokens firmados con secreto

### Negativas

- ⚠️ No se pueden revocar fácilmente (requeriría blacklist)
- ⚠️ Tokens almacenados en localStorage (vulnerable a XSS)
- ⚠️ Tamaño del token (aunque pequeño en nuestro caso)
- ⚠️ Tokens expirados requieren refresh token

### Mitigaciones

- **Refresh Tokens**: Tokens de acceso cortos (8 horas) + refresh tokens largos (7 días)
- **HTTPS**: Todos los tokens se transmiten por HTTPS
- **Validación estricta**: Validación de tokens en cada request
- **Expiración**: Tokens con expiración para limitar ventana de ataque
- **Logout**: Invalidación de refresh tokens al hacer logout

## Implementación

### Tokens
- **Access Token**: 
  - Expiración: 8 horas
  - Contiene: id_usuario, ci, rol
  - Almacenado en: localStorage
  - Usado en: Header `Authorization: Bearer <token>`

- **Refresh Token**:
  - Expiración: 7 días
  - Almacenado en: localStorage
  - Usado para: Renovar access token sin re-login

### Seguridad
- Tokens firmados con `JWT_SECRET` y `REFRESH_SECRET`
- Validación en middleware de autenticación
- Contraseñas hasheadas con bcrypt (10 rounds)
- Tokens no incluyen información sensible

### Flujo
1. Usuario hace login → Backend valida credenciales
2. Backend genera access token + refresh token
3. Tokens se envían al frontend
4. Frontend almacena tokens en localStorage
5. Cada request incluye access token en header
6. Si access token expira, frontend usa refresh token para obtener uno nuevo
7. Si refresh token expira, usuario debe hacer login nuevamente

## Alternativa Futura

Si se requiere revocación de tokens, se puede implementar:
- Blacklist de tokens en Redis
- Verificación de blacklist en middleware
- Invalidación de tokens al hacer logout

## Referencias

- [JWT.io](https://jwt.io/)
- [RFC 7519 - JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

# ADR-006: Separación de bases de datos (sgst_db y camunda_db)

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

El sistema SGST utiliza dos sistemas que requieren persistencia:
1. **Aplicación SGST**: Usuarios, trámites, fichas, notificaciones, etc.
2. **Camunda 8**: Procesos BPMN, instancias de proceso, historial, etc.

Necesitamos decidir si usar:
- Una sola base de datos para ambos
- Dos bases de datos separadas

## Opciones Consideradas

### Opción 1: Dos bases de datos separadas (ELEGIDA)
- **Pros**:
  - Separación clara de responsabilidades
  - Aislamiento de datos
  - Optimizaciones independientes
  - Backups independientes
  - Escalabilidad independiente
  - Menos riesgo de conflictos de schema
  - Camunda puede gestionar su propia base de datos
- **Contras**:
  - Más complejidad operacional
  - Dos conexiones a gestionar
  - Posible duplicación de recursos

### Opción 2: Una sola base de datos
- **Pros**:
  - Más simple operacionalmente
  - Una sola conexión
  - Menos recursos
- **Contras**:
  - Acoplamiento entre sistemas
  - Conflictos potenciales de schema
  - Difícil optimizar independientemente
  - Backups más complejos
  - Camunda puede requerir cambios de schema que afecten la aplicación

## Decisión

Se eligió usar **dos bases de datos separadas**: `sgst_db` y `camunda_db`.

### Razones principales:

1. **Separación de Responsabilidades**: Datos de aplicación vs datos de procesos
2. **Aislamiento**: Cambios en Camunda no afectan la aplicación y viceversa
3. **Optimización Independiente**: Cada base de datos puede optimizarse según sus necesidades
4. **Backups Independientes**: Backups separados permiten restaurar uno sin afectar el otro
5. **Escalabilidad**: Pueden escalarse independientemente según la carga
6. **Gestión de Camunda**: Camunda gestiona su propia base de datos sin interferencias

## Consecuencias

### Positivas

- ✅ Aislamiento completo entre datos de aplicación y procesos
- ✅ Optimizaciones independientes
- ✅ Backups y restauraciones independientes
- ✅ Escalabilidad independiente
- ✅ Menos riesgo de conflictos de schema
- ✅ Camunda puede actualizarse sin afectar la aplicación

### Negativas

- ⚠️ Más complejidad operacional (dos bases de datos que gestionar)
- ⚠️ Dos conexiones a configurar
- ⚠️ Posible uso adicional de recursos (aunque mínimo)

### Mitigaciones

- Scripts de inicialización automáticos (`init.sql`)
- Documentación clara de configuración
- Docker Compose gestiona ambas bases de datos automáticamente
- Variables de entorno para configuración

## Implementación

### sgst_db (Aplicación)
- **Gestión**: Prisma ORM
- **Schema**: Definido en `backend/prisma/schema.prisma`
- **Migraciones**: Prisma migrations
- **Contenido**: Usuarios, trámites, fichas, grupos, notificaciones, auditoría, documentos

### camunda_db (Camunda)
- **Gestión**: Camunda 8 (Zeebe, Operate, Tasklist, Identity)
- **Schema**: Gestionado automáticamente por Camunda
- **Migraciones**: Automáticas al iniciar Camunda
- **Contenido**: Procesos BPMN, instancias, historial, tareas, variables

### Configuración
- Ambas bases de datos en el mismo servidor PostgreSQL
- Usuario y contraseña compartidos (pueden separarse si es necesario)
- Conexiones separadas desde cada servicio

## Referencias

- [Camunda Database Configuration](https://docs.camunda.io/docs/components/operate/operate-configuration/database/)
- [Prisma Multi-Database](https://www.prisma.io/docs/concepts/database-connectors)

---

# ADR-007: Patrón de Job Workers para comunicación asíncrona

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

Necesitamos que Camunda Zeebe se comunique con nuestro Backend API para ejecutar acciones como:
- Crear trámites
- Actualizar estados
- Enviar notificaciones

Camunda Zeebe ofrece dos formas principales de comunicación:
1. **Job Workers**: Patrón pull (workers consultan por jobs)
2. **REST API**: Llamadas HTTP directas desde procesos BPMN

## Opciones Consideradas

### Opción 1: Job Workers (ELEGIDA)
- **Pros**:
  - Patrón recomendado por Camunda
  - Desacoplamiento temporal (proceso continúa aunque backend esté ocupado)
  - Escalabilidad (múltiples workers pueden consumir jobs)
  - Reintentos automáticos en caso de fallo
  - Timeouts configurables
  - Procesamiento paralelo
- **Contras**:
  - Latencia adicional (polling)
  - Más complejo de implementar inicialmente

### Opción 2: REST API desde BPMN
- **Pros**:
  - Más simple de implementar
  - Latencia más baja (sin polling)
- **Contras**:
  - Acoplamiento fuerte (proceso espera respuesta)
  - Difícil manejar timeouts y reintentos
  - Menos escalable
  - Proceso bloqueado si backend está ocupado

### Opción 3: Message Queue (RabbitMQ, Kafka)
- **Pros**:
  - Desacoplamiento completo
  - Alta escalabilidad
- **Contras**:
  - Infraestructura adicional compleja
  - Overhead de serialización
  - Más difícil de debuggear
  - Overkill para nuestro caso de uso

## Decisión

Se eligió el **patrón de Job Workers** para comunicación asíncrona entre Camunda y el Backend.

### Razones principales:

1. **Patrón Recomendado**: Es el patrón estándar y recomendado por Camunda
2. **Desacoplamiento**: El proceso no se bloquea esperando el backend
3. **Escalabilidad**: Múltiples instancias del orchestrator pueden consumir jobs
4. **Confiabilidad**: Reintentos automáticos y manejo de errores
5. **Rendimiento**: Procesamiento paralelo de múltiples jobs
6. **Flexibilidad**: Fácil agregar nuevos job workers

## Consecuencias

### Positivas

- ✅ Desacoplamiento temporal entre Camunda y Backend
- ✅ Escalabilidad horizontal (múltiples workers)
- ✅ Procesamiento paralelo (hasta 10 jobs simultáneos)
- ✅ Reintentos automáticos en caso de fallo
- ✅ Timeouts configurables (30 segundos)
- ✅ Proceso no se bloquea si backend está ocupado
- ✅ Fácil agregar nuevos job workers

### Negativas

- ⚠️ Latencia adicional por polling (500ms)
- ⚠️ Más complejo de implementar que REST directo
- ⚠️ Requiere servicio orchestrator separado

### Mitigaciones

- Poll interval reducido a 500ms para baja latencia
- Procesamiento paralelo (maxJobsToActivate: 10) para alto throughput
- Timeouts configurados (30s) para evitar esperas infinitas
- Logging detallado para debugging

## Implementación

### Job Workers Implementados

1. **crear-tramite**
   - Crea un trámite en el backend
   - Retorna `id_tramite` al proceso
   - Maneja casos donde el trámite ya existe

2. **actualizar-estado**
   - Actualiza el estado de un trámite
   - Valida transiciones permitidas
   - Actualiza observaciones y motivo de cierre

3. **enviar-notificacion**
   - Envía notificaciones automáticas
   - Crea notificaciones en el backend
   - Soporta diferentes tipos de notificaciones

### Configuración

```typescript
{
  taskType: 'crear-tramite',
  maxJobsToActivate: 10,      // Procesar hasta 10 jobs en paralelo
  timeout: 30000,              // 30 segundos de timeout
  pollInterval: 500,          // Poll cada 500ms
}
```

### Flujo

1. Camunda crea un job cuando el proceso llega a una actividad de servicio
2. Orchestrator (job worker) consulta por jobs disponibles (polling cada 500ms)
3. Orchestrator recibe el job y ejecuta la acción en el Backend
4. Orchestrator completa el job en Camunda con los resultados
5. Camunda continúa con el siguiente paso del proceso

## Referencias

- [Zeebe Job Workers](https://docs.camunda.io/docs/components/zeebe/technical-deployment/job-workers/)
- [Zeebe Node.js Client - Workers](https://github.com/camunda/zeebe-client-node-js#workers)

---

# ADR-008: Frontend con React y TypeScript

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

Necesitamos elegir la tecnología para el frontend del Sistema SGST. Requisitos:
- Interfaz de usuario moderna y responsiva
- Type safety
- Buen rendimiento
- Ecosistema maduro
- Facilidad de desarrollo
- Buena experiencia de desarrollador

## Opciones Consideradas

### Opción 1: React + TypeScript (ELEGIDA)
- **Pros**:
  - Ecosistema muy maduro y amplio
  - Gran comunidad y recursos
  - TypeScript para type safety
  - Componentes reutilizables
  - Virtual DOM para buen rendimiento
  - Herramientas excelentes (Vite, ESLint)
  - Fácil encontrar desarrolladores con experiencia
- **Contras**:
  - Curva de aprendizaje inicial
  - Muchas decisiones de arquitectura (state management, routing, etc.)

### Opción 2: Vue.js + TypeScript
- **Pros**:
  - Sintaxis más simple
  - Buen rendimiento
  - Documentación excelente
- **Contras**:
  - Ecosistema más pequeño que React
  - Menos recursos y ejemplos disponibles

### Opción 3: Angular
- **Pros**:
  - Framework completo (routing, forms, etc.)
  - TypeScript nativo
  - Muy estructurado
- **Contras**:
  - Curva de aprendizaje más pronunciada
  - Más verboso
  - Overhead para proyectos pequeños/medianos

### Opción 4: Svelte
- **Pros**:
  - Muy performante
  - Sintaxis simple
- **Contras**:
  - Ecosistema más pequeño
  - Menos maduro
  - Menos recursos disponibles

### Opción 5: Vanilla JavaScript/TypeScript
- **Pros**:
  - Sin dependencias de framework
  - Control total
- **Contras**:
  - Mucho más código boilerplate
  - Menos productivo
  - Sin ecosistema de componentes

## Decisión

Se eligió **React 19.1.0 + TypeScript + Vite** para el frontend.

### Razones principales:

1. **Ecosistema Maduro**: Amplia comunidad y recursos disponibles
2. **Type Safety**: TypeScript previene errores en tiempo de compilación
3. **Rendimiento**: Virtual DOM y optimizaciones de React
4. **Productividad**: Componentes reutilizables y herramientas excelentes
5. **Herramientas**: Vite para desarrollo rápido, ESLint para calidad
6. **Mantenibilidad**: Código más fácil de mantener con TypeScript
7. **Talent Pool**: Fácil encontrar desarrolladores con experiencia

## Consecuencias

### Positivas

- ✅ Type safety completo con TypeScript
- ✅ Componentes reutilizables
- ✅ Buen rendimiento con Virtual DOM
- ✅ Desarrollo rápido con Vite (HMR)
- ✅ Gran ecosistema de librerías
- ✅ Fácil encontrar desarrolladores
- ✅ Herramientas excelentes (ESLint, Prettier, etc.)

### Negativas

- ⚠️ Curva de aprendizaje inicial
- ⚠️ Muchas decisiones de arquitectura (state management, routing, etc.)
- ⚠️ Bundle size puede ser grande (mitigado con code splitting)

### Decisiones Adicionales

- **State Management**: Context API (para auth y notificaciones) en lugar de Redux (más simple para nuestro caso)
- **Build Tool**: Vite (más rápido que Webpack)
- **Styling**: CSS modules (mantenibilidad y scope local)

## Implementación

### Stack Tecnológico
- **React**: 19.1.0
- **TypeScript**: ~5.8.3
- **Vite**: ^7.0.4 (build tool)
- **Context API**: Para estado global (AuthContext, ToastContext)

### Estructura
```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── contexts/       # Context providers
│   ├── services/       # API services
│   └── types/          # TypeScript types
```

### Características
- Hot Module Replacement (HMR) para desarrollo rápido
- TypeScript estricto para type safety
- ESLint para calidad de código
- Componentes funcionales con hooks
- Context API para estado global

## Referencias

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)

---

# ADR-009: PostgreSQL como base de datos principal

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

Necesitamos elegir una base de datos para el Sistema SGST que:
- Soporte transacciones ACID
- Tenga buen rendimiento
- Sea confiable y estable
- Soporte relaciones complejas
- Sea compatible con Prisma ORM
- Sea adecuada para datos estructurados
- Tenga buen soporte y comunidad

## Opciones Consideradas

### Opción 1: PostgreSQL (ELEGIDA)
- **Pros**:
  - Base de datos relacional robusta y madura
  - Excelente soporte para relaciones complejas
  - Transacciones ACID completas
  - Muy confiable y estable
  - Excelente rendimiento
  - Open source y gratuita
  - Gran comunidad y recursos
  - Soporte para JSON (útil para campos flexibles)
  - Compatible con Prisma
  - Muy usado en producción
- **Contras**:
  - Requiere más recursos que SQLite
  - Configuración más compleja que SQLite

### Opción 2: MySQL
- **Pros**:
  - Muy popular
  - Buen rendimiento
  - Amplia comunidad
- **Contras**:
  - Menos características avanzadas que PostgreSQL
  - Algunas limitaciones en transacciones complejas
  - Menos soporte para tipos de datos avanzados

### Opción 3: SQLite
- **Pros**:
  - Muy simple (archivo único)
  - Sin servidor
  - Perfecto para desarrollo
- **Contras**:
  - No adecuado para producción con múltiples usuarios
  - Limitaciones en concurrencia
  - Sin soporte para múltiples conexiones simultáneas

### Opción 4: MongoDB (NoSQL)
- **Pros**:
  - Flexible (schema-less)
  - Escalable horizontalmente
- **Contras**:
  - No es relacional (nuestros datos son relacionales)
  - Sin transacciones ACID completas
  - Menos adecuado para datos estructurados
  - Prisma tiene mejor soporte para SQL

## Decisión

Se eligió **PostgreSQL** como base de datos principal.

### Razones principales:

1. **Relaciones Complejas**: Excelente soporte para relaciones entre entidades
2. **ACID**: Transacciones ACID completas para integridad de datos
3. **Confiabilidad**: Muy estable y confiable en producción
4. **Rendimiento**: Excelente rendimiento incluso con grandes volúmenes
5. **Prisma**: Compatibilidad excelente con Prisma ORM
6. **Open Source**: Gratuita y con gran comunidad
7. **Características Avanzadas**: Soporte para JSON, full-text search, etc.
8. **Estándar**: Ampliamente usado y probado en producción

## Consecuencias

### Positivas

- ✅ Excelente soporte para relaciones complejas
- ✅ Transacciones ACID para integridad de datos
- ✅ Muy confiable y estable
- ✅ Buen rendimiento
- ✅ Compatible con Prisma
- ✅ Gran comunidad y recursos
- ✅ Soporte para tipos de datos avanzados (JSON, arrays, etc.)
- ✅ Índices eficientes para optimización

### Negativas

- ⚠️ Requiere servidor (no es embedded como SQLite)
- ⚠️ Configuración más compleja que SQLite
- ⚠️ Consume más recursos que SQLite

### Mitigaciones

- Docker Compose gestiona PostgreSQL automáticamente
- Scripts de inicialización automáticos
- Documentación clara de configuración
- Health checks para monitoreo

## Implementación

### Configuración
- **Versión**: PostgreSQL 15 (Alpine)
- **Puerto**: 5432
- **Bases de Datos**:
  - `sgst_db`: Datos de la aplicación
  - `camunda_db`: Datos de Camunda
- **Usuario**: `sgst_user`
- **Persistencia**: Volumen Docker para datos

### Características Utilizadas
- Relaciones foreign key
- Índices para optimización
- Transacciones para operaciones críticas
- Tipos de datos: INT, VARCHAR, TEXT, BOOLEAN, TIMESTAMP, etc.
- Constraints: UNIQUE, NOT NULL, etc.

## Referencias

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma PostgreSQL Connector](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

---

# ADR-010: Node.js y Express para el Backend API

## Estado
Aceptado

## Fecha
Enero 2025

## Contexto

Necesitamos elegir la tecnología para el Backend API del Sistema SGST. Requisitos:
- API REST
- Buen rendimiento
- TypeScript support
- Ecosistema maduro
- Facilidad de desarrollo
- Compatibilidad con Prisma
- Buen soporte para async/await

## Opciones Consideradas

### Opción 1: Node.js + Express + TypeScript (ELEGIDA)
- **Pros**:
  - Muy popular y ampliamente usado
  - Gran ecosistema de librerías
  - TypeScript support excelente
  - Express es simple y flexible
  - Buen rendimiento (I/O asíncrono)
  - Mismo lenguaje que frontend (JavaScript/TypeScript)
  - Compatible con Prisma
  - Fácil encontrar desarrolladores
- **Contras**:
  - Single-threaded (aunque con event loop eficiente)
  - Menos adecuado para CPU-intensive tasks

### Opción 2: Python + FastAPI
- **Pros**:
  - Muy productivo
  - Type hints (similar a TypeScript)
  - Buen rendimiento
  - Gran ecosistema
- **Contras**:
  - Lenguaje diferente al frontend
  - Menos integración con ecosistema JavaScript
  - Prisma no tiene soporte oficial para Python

### Opción 3: Go
- **Pros**:
  - Excelente rendimiento
  - Compilado (rápido)
  - Bueno para concurrencia
- **Contras**:
  - Curva de aprendizaje
  - Ecosistema más pequeño
  - Prisma no tiene soporte oficial para Go

### Opción 4: Java + Spring Boot
- **Pros**:
  - Muy maduro y estable
  - Gran ecosistema empresarial
  - Excelente rendimiento
- **Contras**:
  - Más verboso
  - Curva de aprendizaje
  - Overhead para proyectos pequeños/medianos
  - Prisma no tiene soporte oficial para Java

### Opción 5: .NET Core
- **Pros**:
  - Muy performante
  - Type safety
  - Buen soporte empresarial
- **Contras**:
  - Ecosistema más pequeño en open source
  - Prisma no tiene soporte oficial para .NET

## Decisión

Se eligió **Node.js + Express + TypeScript** para el Backend API.

### Razones principales:

1. **Mismo Stack**: Mismo lenguaje (TypeScript) que el frontend
2. **Ecosistema**: Gran ecosistema de librerías npm
3. **Prisma**: Compatibilidad excelente con Prisma ORM
4. **Rendimiento**: Buen rendimiento para I/O (API REST)
5. **Simplicidad**: Express es simple y flexible
6. **TypeScript**: Type safety completo
7. **Productividad**: Desarrollo rápido y productivo
8. **Talent Pool**: Fácil encontrar desarrolladores

## Consecuencias

### Positivas

- ✅ Mismo lenguaje que frontend (TypeScript)
- ✅ Gran ecosistema de librerías
- ✅ Compatible con Prisma
- ✅ Buen rendimiento para I/O
- ✅ Type safety con TypeScript
- ✅ Desarrollo rápido y productivo
- ✅ Fácil encontrar desarrolladores
- ✅ Express es simple y flexible

### Negativas

- ⚠️ Single-threaded (aunque event loop maneja I/O eficientemente)
- ⚠️ Menos adecuado para CPU-intensive tasks (no es nuestro caso)
- ⚠️ Callback hell si no se usa async/await correctamente

### Mitigaciones

- Uso consistente de async/await
- Manejo adecuado de errores
- Middleware para logging y error handling
- Health checks para monitoreo

## Implementación

### Stack Tecnológico
- **Node.js**: Runtime
- **Express**: Framework web
- **TypeScript**: Lenguaje
- **Prisma**: ORM
- **JWT**: Autenticación (jsonwebtoken)
- **bcrypt**: Hashing de contraseñas
- **multer**: Manejo de archivos
- **cors**: Configuración CORS

### Estructura
```
backend/
├── src/
│   ├── controllers/    # Lógica de controladores
│   ├── routes/         # Definición de rutas
│   ├── services/       # Servicios de negocio
│   ├── middleware/     # Middleware (auth, etc.)
│   ├── lib/            # Utilidades (Prisma client)
│   └── utils/          # Utilidades generales
└── prisma/
    └── schema.prisma   # Schema de base de datos
```

### Características
- API REST
- Autenticación JWT
- Middleware de autenticación
- Validación de datos
- Manejo de errores centralizado
- Logging
- Health checks

## Referencias

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

## Proceso de Creación de ADRs

1. **Identificar la decisión**: Cuando se toma una decisión arquitectónica importante
2. **Crear el ADR**: Usar el template y documentar la decisión
3. **Revisar**: El equipo revisa y aprueba el ADR
4. **Actualizar estado**: Marcar como "Aceptado" una vez aprobado
5. **Mantener**: Actualizar el ADR si la decisión cambia o se depreca

## Referencias Generales

- [Documentación sobre ADRs](https://adr.github.io/)
- [Formato Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

---

**Documento generado para el Sistema SGST**
**Última actualización**: Enero 2025


