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


