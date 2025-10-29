# Sistema de Niveles de Acceso para Administradores

## Resumen

Se implementó un sistema de diferenciación de administradores mediante niveles de acceso, permitiendo tres tipos distintos de administradores con permisos específicos según lo descrito en `contexto_integracion_camunda_frontend.md`.

## Cambios Implementados

### 1. Base de Datos (Prisma Schema)

**Archivo:** `backend/prisma/schema.prisma`

Se agregó el campo `nivel_acceso` al modelo `Usuario`:

```prisma
model Usuario {
  // ... otros campos
  rol              String          @default("estudiante")
  nivel_acceso     Int?            // 1=administrativo, 2=docente, 3=sistema
  activo           Boolean         @default(true)
  // ... otros campos
}
```

**Niveles de Acceso:**
- **Nivel 3 - Administrador del Sistema**: Acceso total al sistema
- **Nivel 2 - Administrador Docente**: Puede crear trámites, asignar grupos, gestionar flujos
- **Nivel 1 - Administrador Administrativo**: Acceso básico (funcionalidad a definir)

### 2. Backend

#### Actualización del Auth Controller

**Archivo:** `backend/src/controllers/authController.ts`

Se agregó validación para verificar que el usuario tenga contraseña configurada antes de compararla:

```typescript
// Verificar que el usuario tenga contraseña configurada
if (!usuario.password) {
  return res.status(401).json({ error: 'Usuario sin contraseña configurada' });
}
```

### 3. Frontend

#### 3.1 Context de Autenticación

**Archivo:** `frontend/src/contexts/AuthContext.tsx`

**Cambios en la interfaz `AuthUser`:**
```typescript
export interface AuthUser {
  // ... otros campos
  nivel_acceso?: number; // 1=admin_administrativo, 2=admin_docente, 3=admin_sistema
  // ... otros campos
}
```

**Nuevas funciones de utilidad:**
```typescript
hasAccessLevel(minLevel: number): boolean  // Verifica nivel mínimo requerido
isAdminSistema(): boolean                  // Verifica si es Admin Sistema (nivel 3)
isAdminDocente(): boolean                  // Verifica si es Admin Docente (nivel 2)
isAdminAdministrativo(): boolean           // Verifica si es Admin Administrativo (nivel 1)
```

#### 3.2 Aplicación Principal

**Archivo:** `frontend/src/App.tsx`

**Menú adaptado según nivel de acceso:**
- **Trámites**: Todos los administradores (nivel 1+)
- **Crear Trámite**: Solo Admin Docente y Sistema (nivel 2+)
- **Gestionar Usuarios**: Solo Admin Sistema (nivel 3)
- **Crear Usuario**: Solo Admin Sistema (nivel 3)

**Función para mostrar etiquetas de roles:**
```typescript
function getRoleLabel(role: string, nivel_acceso?: number): string {
  if (role === 'admin') {
    switch (nivel_acceso) {
      case 3: return 'Admin. Sistema';
      case 2: return 'Admin. Docente';
      case 1: return 'Admin. Administrativo';
      default: return 'Administrador';
    }
  }
  // ... otros roles
}
```

#### 3.3 Lista de Trámites

**Archivo:** `frontend/src/components/TramitesList.tsx`

**Control de acciones según nivel:**
- **Aprobar/Rechazar trámites**: Solo Admin Docente (nivel 2+) y docentes responsables
- **Eliminar trámites**: Solo Admin Docente (nivel 2+) y Admin Sistema (nivel 3)

#### 3.4 Formulario de Creación de Usuarios

**Archivo:** `frontend/src/components/CreateUsuarioForm.tsx`

**Selector de nivel de acceso condicional:**
Cuando se selecciona el rol "Administrador", se muestra un selector para elegir el nivel de acceso:

- Nivel 3 - Administrador del Sistema
- Nivel 2 - Administrador Docente  
- Nivel 1 - Administrador Administrativo

El campo `nivel_acceso` se incluye en el payload solo cuando el rol es "administrador".

#### 3.5 Lista de Usuarios

**Archivo:** `frontend/src/components/UsuariosList.tsx`

**Visualización mejorada:**
Se agregó la función `getRolLabel` que muestra el nivel específico del administrador:

```typescript
const getRolLabel = (rol: string, nivel_acceso?: number) => {
  if (rol === 'administrador') {
    switch (nivel_acceso) {
      case 3: return 'Admin. Sistema';
      case 2: return 'Admin. Docente';
      case 1: return 'Admin. Administrativo';
      default: return 'Administrador';
    }
  }
  return rol.charAt(0).toUpperCase() + rol.slice(1);
};
```

## Permisos por Nivel

### Nivel 3 - Administrador del Sistema
✅ Ver todos los trámites  
✅ Crear trámites  
✅ Aprobar/Rechazar trámites  
✅ Eliminar trámites  
✅ Gestionar usuarios (crear, editar, activar/desactivar)  
✅ Acceso a configuración del sistema  
✅ Auditoría completa  

### Nivel 2 - Administrador Docente
✅ Ver todos los trámites  
✅ Crear trámites  
✅ Aprobar/Rechazar trámites  
✅ Eliminar trámites  
✅ Asignar grupos a trámites  
✅ Monitorear estado de trámites  
❌ Gestionar usuarios  
❌ Configuración del sistema  

### Nivel 1 - Administrador Administrativo
✅ Ver todos los trámites  
❌ Crear trámites  
❌ Aprobar/Rechazar trámites  
❌ Eliminar trámites  
❌ Asignar grupos  
❌ Gestionar usuarios  
❌ Configuración del sistema  

## Migración de Datos

### Usuarios Existentes

Se ha ejecutado la migración automática de usuarios con roles antiguos:

**Administradores migrados:**
- `administrador_sistema` → `administrador` con `nivel_acceso = 3`
- `administrador_docente` → `administrador` con `nivel_acceso = 2`
- `administrador_administrativo` → `administrador` con `nivel_acceso = 1`

**Docentes migrados:**
- `docente_responsable` → `docente`
- `docente_asistente` → `docente`

La diferenciación de responsables y asistentes ahora se realiza mediante la tabla `UsuarioGrupo` con el campo `rol_en_grupo`.

### Para Nuevos Usuarios

Para usuarios administradores creados después de la migración:
1. El campo `nivel_acceso` es **obligatorio** en el formulario de creación
2. Se debe seleccionar el nivel apropiado (1, 2 o 3)
3. El sistema valida y guarda el nivel correctamente

### Estado Actual del Sistema

Después de la migración:
- ✅ 3 Administradores (1 Sistema, 1 Docente, 1 Administrativo)
- ✅ 7 Docentes
- ✅ 6 Estudiantes
- ✅ 3 Consultantes

## Validaciones

- El campo `nivel_acceso` es **obligatorio** al crear un usuario con rol "administrador"
- Solo puede tener valores: 1, 2 o 3
- Solo aplica para usuarios con rol "administrador"
- Los componentes verifican el nivel antes de mostrar opciones o permitir acciones

## Testing

Para probar el sistema:
1. Crear usuarios administradores con diferentes niveles
2. Iniciar sesión con cada tipo de administrador
3. Verificar que el menú y las acciones disponibles coincidan con los permisos
4. Intentar acceder directamente a vistas restringidas (deben bloquearse)

## Próximos Pasos

- [ ] Implementar funcionalidades específicas para Admin Administrativo (nivel 1)
- [ ] Agregar página de auditoría accesible solo para Admin Sistema
- [ ] Implementar configuración del sistema para Admin Sistema
- [ ] Agregar logs detallados de acciones según nivel de acceso
- [ ] Considerar agregar más niveles si es necesario

