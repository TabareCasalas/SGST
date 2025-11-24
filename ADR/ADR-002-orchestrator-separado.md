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


