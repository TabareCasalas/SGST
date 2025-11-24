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


