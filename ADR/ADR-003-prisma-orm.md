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


