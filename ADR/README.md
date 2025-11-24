# Architecture Decision Records (ADR)

Este directorio contiene los Architecture Decision Records (ADR) del Sistema SGST.

## ¿Qué es un ADR?

Un Architecture Decision Record es un documento que captura una decisión arquitectónica importante junto con su contexto y consecuencias. Los ADRs ayudan a:

- Documentar el "por qué" detrás de las decisiones técnicas
- Facilitar la comunicación entre miembros del equipo
- Proporcionar contexto histórico para futuras decisiones
- Evitar repetir discusiones sobre decisiones ya tomadas

## Formato

Cada ADR sigue el siguiente formato:

- **Título**: Número y nombre descriptivo
- **Estado**: Propuesto, Aceptado, Deprecado, Reemplazado
- **Contexto**: Situación que requiere una decisión
- **Opciones Consideradas**: Alternativas evaluadas
- **Decisión**: Opción elegida
- **Consecuencias**: Impacto positivo y negativo de la decisión

## Índice de ADRs

| ADR | Título | Estado |
|-----|--------|--------|
| [ADR-001](./ADR-001-camunda-zeebe.md) | Uso de Camunda 8 (Zeebe) para orquestación de procesos | Aceptado |
| [ADR-002](./ADR-002-orchestrator-separado.md) | Separación del Orchestrator como servicio independiente | Aceptado |
| [ADR-003](./ADR-003-prisma-orm.md) | Uso de Prisma como ORM | Aceptado |
| [ADR-004](./ADR-004-docker-microservicios.md) | Arquitectura de microservicios con Docker | Aceptado |
| [ADR-005](./ADR-005-autenticacion-jwt.md) | Autenticación basada en JWT | Aceptado |
| [ADR-006](./ADR-006-separacion-bases-datos.md) | Separación de bases de datos (sgst_db y camunda_db) | Aceptado |
| [ADR-007](./ADR-007-job-workers-asincronos.md) | Patrón de Job Workers para comunicación asíncrona | Aceptado |
| [ADR-008](./ADR-008-frontend-react-typescript.md) | Frontend con React y TypeScript | Aceptado |
| [ADR-009](./ADR-009-postgresql-base-datos.md) | PostgreSQL como base de datos principal | Aceptado |
| [ADR-010](./ADR-010-nodejs-backend.md) | Node.js y Express para el Backend API | Aceptado |

## Proceso de Creación de ADRs

1. **Identificar la decisión**: Cuando se toma una decisión arquitectónica importante
2. **Crear el ADR**: Usar el template y documentar la decisión
3. **Revisar**: El equipo revisa y aprueba el ADR
4. **Actualizar estado**: Marcar como "Aceptado" una vez aprobado
5. **Mantener**: Actualizar el ADR si la decisión cambia o se depreca

## Referencias

- [Documentación sobre ADRs](https://adr.github.io/)
- [Formato Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)

---

**Última actualización**: Enero 2025


