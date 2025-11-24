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


