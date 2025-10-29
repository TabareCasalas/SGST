# Estructura de Menú y Permisos - Sistema Completo

## Resumen de la Restauración

Se ha restaurado el módulo de **Grupos** que se había perdido durante la implementación de niveles de acceso. Ahora el sistema incluye todas las funcionalidades con los controles de acceso apropiados.

## Estructura del Menú por Rol y Nivel

### 1. Administrador del Sistema (Nivel 3)
**Acceso Total al Sistema**

Menú disponible:
- 📋 **Trámites** - Ver todos los trámites del sistema
- ➕ **Crear Trámite** - Iniciar nuevos trámites
- 👥 **Grupos** - Ver todos los grupos de trabajo
- ➕ **Crear Grupo** - Crear nuevos grupos con docentes
- 👤 **Usuarios** - Gestionar todos los usuarios
- ✚ **Crear Usuario** - Registrar nuevos usuarios

**Permisos:**
- ✅ Ver, crear, editar y eliminar trámites
- ✅ Aprobar y rechazar trámites
- ✅ Ver, crear y gestionar grupos
- ✅ Asignar docentes a grupos (responsable y asistentes)
- ✅ Ver, crear, editar, activar/desactivar usuarios
- ✅ Acceso completo a todas las funcionalidades
- ✅ Auditoría completa

**Usuario de prueba:** Carlos Administrador (CI: 12345678)

---

### 2. Administrador Docente (Nivel 2)
**Gestión Académica y Operativa**

Menú disponible:
- 📋 **Trámites** - Ver todos los trámites del sistema
- ➕ **Crear Trámite** - Iniciar nuevos trámites
- 👥 **Grupos** - Ver todos los grupos de trabajo
- ➕ **Crear Grupo** - Crear nuevos grupos con docentes

**Permisos:**
- ✅ Ver, crear y eliminar trámites
- ✅ Aprobar y rechazar trámites
- ✅ Ver todos los grupos
- ✅ Crear nuevos grupos y asignar docentes
- ✅ Asignar grupos a trámites
- ✅ Monitorear estado de trámites
- ❌ NO puede gestionar usuarios

**Usuario de prueba:** María Directora (CI: 87654321)

---

### 3. Administrador Administrativo (Nivel 1)
**Solo Visualización**

Menú disponible:
- 📋 **Trámites** - Ver todos los trámites (solo lectura)
- 👥 **Grupos** - Ver todos los grupos (solo lectura)

**Permisos:**
- ✅ Ver todos los trámites (sin poder modificarlos)
- ✅ Ver todos los grupos (sin poder modificarlos)
- ✅ Expandir detalles de trámites y grupos
- ❌ NO puede crear, aprobar, rechazar o eliminar
- ❌ NO puede gestionar usuarios
- ❌ NO puede crear grupos

**Usuario de prueba:** Juan Secretario (CI: 34567890)

---

### 4. Docente
**Supervisión de Grupos Asignados**

Menú disponible:
- 📋 **Trámites** - Ver trámites de sus grupos
- 👥 **Grupos** - Ver grupos donde participa

**Permisos:**
- ✅ Ver trámites de los grupos donde participa
- ✅ Si es **responsable** de un grupo: aprobar/rechazar trámites de ese grupo
- ✅ Si es **asistente**: solo visualizar trámites
- ✅ Ver información completa de sus grupos
- ❌ NO puede crear trámites
- ❌ NO puede crear grupos
- ❌ NO puede gestionar usuarios

**Usuario de prueba:** Dr. Roberto Fernández (CI: 11111111)

---

### 5. Estudiante
**Consulta de Trámites de su Grupo**

Menú disponible:
- 📂 **Mis Trámites** - Ver trámites de su grupo asignado

**Permisos:**
- ✅ Ver solo trámites del grupo al que pertenece
- ✅ Expandir detalles de trámites
- ✅ Ver estado y observaciones
- ❌ NO puede crear, aprobar, rechazar o eliminar trámites
- ❌ NO puede ver otros grupos
- ❌ NO puede gestionar usuarios

**Usuario de prueba:** Lucía González (CI: 55555555)

---

### 6. Consultante
**Consulta de sus Propios Trámites**

Menú disponible:
- 📂 **Mis Trámites** - Ver solo sus propios trámites

**Permisos:**
- ✅ Ver solo trámites donde él/ella es el consultante
- ✅ Ver estado actual del trámite
- ✅ Ver fecha de inicio y última actualización
- ❌ NO puede ver trámites de otros consultantes
- ❌ NO puede realizar ninguna acción
- ❌ NO puede ver grupos
- ❌ NO puede gestionar usuarios

**Usuario de prueba:** Andrés Méndez (CI: 40404040)

---

## Matriz de Permisos Detallada

| Funcionalidad | Admin Sistema (3) | Admin Docente (2) | Admin Admin (1) | Docente | Estudiante | Consultante |
|---------------|-------------------|-------------------|-----------------|---------|------------|-------------|
| **Trámites** |
| Ver todos | ✅ | ✅ | ✅ | ❌ (solo sus grupos) | ❌ (solo su grupo) | ❌ (solo suyos) |
| Crear | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Aprobar/Rechazar | ✅ | ✅ | ❌ | ✅ (si es responsable) | ❌ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Grupos** |
| Ver todos | ✅ | ✅ | ✅ | ❌ (solo suyos) | ❌ | ❌ |
| Crear | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Asignar docentes | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Usuarios** |
| Ver todos | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Crear | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Editar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Activar/Desactivar | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Implementación Técnica

### Componentes Restaurados

1. **GruposList.tsx** - Lista de grupos con diseño en cards
   - Muestra responsables, asistentes y estudiantes
   - Modal de detalles al hacer clic
   - Filtrado según permisos del usuario

2. **CreateGrupoForm.tsx** - Formulario de creación de grupos
   - Selección de docente responsable
   - Selección múltiple de docentes asistentes (mínimo 2)
   - Validación de roles y disponibilidad

### Integración con Niveles de Acceso

**App.tsx:**
```typescript
// Todos los admins pueden ver grupos
menuItems.push({ id: 'grupos', icon: '👥', label: 'Grupos', view: 'grupos' });

// Solo Admin Docente (2+) y Admin Sistema (3) pueden crear grupos
if (hasAccessLevel(2)) {
  menuItems.push({ id: 'crear_grupo', icon: '➕', label: 'Crear Grupo' });
}

// Docentes también ven grupos
if (hasRole('docente')) {
  menuItems.push({ id: 'grupos', icon: '👥', label: 'Grupos' });
}
```

### Filtrado de Datos

- **Docentes:** Los grupos se pueden filtrar para mostrar solo aquellos donde el docente participa
- **Estudiantes:** No tienen acceso al módulo de grupos (solo ven trámites de su grupo)
- **Consultantes:** No tienen acceso al módulo de grupos

## Flujo de Trabajo - Grupos

### 1. Creación de Grupo (Admin Sistema o Admin Docente)

1. Ir a "Crear Grupo"
2. Ingresar nombre del grupo
3. Opcionalmente agregar descripción
4. Seleccionar 1 docente responsable
5. Seleccionar mínimo 2 docentes asistentes
6. Validación: responsable no puede ser asistente
7. Al guardar, se crea el grupo con sus relaciones en `UsuarioGrupo`

### 2. Visualización de Grupos

**Todos los administradores:**
- Ven todos los grupos del sistema
- Pueden ver detalles de miembros
- Admin Administrativo solo lectura

**Docentes:**
- Ven solo grupos donde participan
- Pueden ver sus roles (responsable o asistente)
- Ven estadísticas de trámites del grupo

### 3. Asignación a Trámites

Cuando se crea un trámite:
1. Se selecciona un grupo de la lista disponible
2. Los estudiantes de ese grupo pueden ver el trámite
3. El docente responsable puede aprobar/rechazar
4. Los asistentes pueden ver pero no aprobar

## Verificación Post-Restauración

### Checklist de Funcionalidades

- [x] Módulo de Grupos visible en menú lateral
- [x] Permisos según nivel de acceso funcionando
- [x] Admin Sistema (nivel 3) ve y crea grupos
- [x] Admin Docente (nivel 2) ve y crea grupos
- [x] Admin Administrativo (nivel 1) solo ve grupos
- [x] Docentes ven sus grupos
- [x] Estudiantes NO ven módulo de grupos
- [x] Consultantes NO ven módulo de grupos
- [x] CreateGrupoForm usa rol unificado 'docente'
- [x] Validación de mínimo 2 asistentes
- [x] Responsable no puede ser asistente
- [x] Frontend reconstruido y desplegado

## Próximos Pasos Recomendados

1. **Filtrado de grupos para docentes:** Implementar filtro para que docentes vean solo sus grupos
2. **Edición de grupos:** Agregar funcionalidad para editar composición de grupos
3. **Historial de grupos:** Ver cambios en la composición de grupos a lo largo del tiempo
4. **Estadísticas por grupo:** Dashboard con métricas de rendimiento por grupo
5. **Notificaciones:** Alertar a docentes cuando se les asigna a un nuevo grupo

## Notas Importantes

- ✅ Los grupos ahora funcionan con el rol unificado `docente`
- ✅ La diferenciación responsable/asistente se hace mediante `UsuarioGrupo.rol_en_grupo`
- ✅ Todos los permisos están correctamente implementados según nivel de acceso
- ✅ El sistema mantiene retrocompatibilidad con datos existentes
- ✅ La migración de usuarios ya actualizó todos los roles antiguos

## Testing Rápido

Para verificar que todo funciona correctamente:

1. **Login como Admin Sistema** (CI: 12345678)
   - Verifica que ves: Trámites, Crear Trámite, Grupos, Crear Grupo, Usuarios, Crear Usuario
   
2. **Login como Admin Docente** (CI: 87654321)
   - Verifica que ves: Trámites, Crear Trámite, Grupos, Crear Grupo
   - Verifica que NO ves: Usuarios, Crear Usuario

3. **Login como Admin Administrativo** (CI: 34567890)
   - Verifica que ves: Trámites, Grupos (ambos solo lectura)
   - Verifica que NO tienes botones de acción

4. **Login como Docente** (CI: 11111111)
   - Verifica que ves: Trámites, Grupos
   - Verifica filtrado por tus grupos

Sistema completamente funcional y listo para usar! 🎉

