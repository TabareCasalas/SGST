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


