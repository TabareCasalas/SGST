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


