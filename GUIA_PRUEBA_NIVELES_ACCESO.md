# Guía de Prueba - Sistema de Niveles de Acceso

## Acceso al Sistema

El sistema está disponible en: `http://localhost:3000`

## Usuarios de Prueba

Después de la migración, puedes usar los siguientes usuarios para probar cada nivel de acceso:

### 1. Administrador del Sistema (Nivel 3)
- **Nombre:** Carlos Administrador
- **CI:** 12345678
- **Permisos:** Acceso completo a todas las funcionalidades

**Qué probar:**
1. Iniciar sesión con CI: `12345678`
2. Verificar que el rol muestre "Admin. Sistema"
3. Verificar que el menú incluya:
   - ✅ Trámites
   - ✅ Crear Trámite
   - ✅ Grupos
   - ✅ Crear Grupo
   - ✅ Usuarios
   - ✅ Crear Usuario
4. Navegar a "Usuarios" y verificar que puedes ver todos los usuarios
5. Crear un nuevo usuario de prueba con cualquier rol
6. Navegar a "Trámites" y verificar que puedes:
   - Ver todos los trámites
   - Aprobar/Rechazar trámites en revisión
   - Eliminar trámites
7. Navegar a "Grupos" y verificar que puedes:
   - Ver todos los grupos con sus miembros
   - Ver responsables y asistentes
   - Hacer clic en un grupo para ver detalles completos
8. Navegar a "Crear Grupo" y:
   - Crear un nuevo grupo de prueba
   - Asignar 1 responsable y mínimo 2 asistentes

### 2. Administrador Docente (Nivel 2)
- **Nombre:** María Directora
- **CI:** 87654321
- **Permisos:** Crear y gestionar trámites, sin acceso a gestión de usuarios

**Qué probar:**
1. Cerrar sesión del usuario anterior (botón de logout en sidebar)
2. Iniciar sesión con CI: `87654321`
3. Verificar que el rol muestre "Admin. Docente"
4. Verificar que el menú incluya:
   - ✅ Trámites
   - ✅ Crear Trámite
   - ✅ Grupos
   - ✅ Crear Grupo
   - ❌ Usuarios (no debe aparecer)
   - ❌ Crear Usuario (no debe aparecer)
5. Intentar crear un trámite nuevo
6. Verificar que puedes aprobar/rechazar trámites
7. Verificar que puedes eliminar trámites
8. Navegar a "Grupos" y verificar que puedes ver todos los grupos
9. Navegar a "Crear Grupo" e intentar crear un nuevo grupo
10. **Intentar acceder directamente a /usuarios** (debe redirigir o no mostrar contenido)

### 3. Administrador Administrativo (Nivel 1)
- **Nombre:** Juan Secretario
- **CI:** 34567890
- **Permisos:** Solo visualización de trámites

**Qué probar:**
1. Cerrar sesión del usuario anterior
2. Iniciar sesión con CI: `34567890`
3. Verificar que el rol muestre "Admin. Administrativo"
4. Verificar que el menú incluya:
   - ✅ Trámites (solo visualización)
   - ✅ Grupos (solo visualización)
   - ❌ Crear Trámite (no debe aparecer)
   - ❌ Crear Grupo (no debe aparecer)
   - ❌ Usuarios (no debe aparecer)
   - ❌ Crear Usuario (no debe aparecer)
5. Navegar a "Trámites"
6. Verificar que **NO** aparecen botones de:
   - ❌ Aprobar
   - ❌ Rechazar
   - ❌ Eliminar
7. Verificar que puedes expandir las filas para ver detalles
8. Navegar a "Grupos"
9. Verificar que puedes ver todos los grupos pero sin opciones de edición
10. Solo debe poder ver la información, sin realizar acciones

### 4. Docente
- **Nombre:** Dr. Roberto Fernández
- **CI:** 11111111
- **Permisos:** Ver trámites de sus grupos y aprobar/rechazar si es responsable

**Qué probar:**
1. Cerrar sesión del usuario anterior
2. Iniciar sesión con CI: `11111111`
3. Verificar que el rol muestre "Docente"
4. Verificar que el menú incluya:
   - ✅ Trámites (filtrados por sus grupos)
   - ✅ Grupos (filtrados por sus grupos)
5. Solo debe ver trámites de grupos donde participa
6. Si es responsable de un grupo, puede aprobar/rechazar trámites de ese grupo
7. Si es asistente, solo puede ver sin aprobar/rechazar
8. Navegar a "Grupos" y verificar que solo ve grupos donde participa
9. Ver su rol dentro de cada grupo (responsable o asistente)

### 5. Estudiante
- **Nombre:** Lucía González
- **CI:** 55555555
- **Permisos:** Ver solo trámites de su grupo

**Qué probar:**
1. Cerrar sesión del usuario anterior
2. Iniciar sesión con CI: `55555555`
3. Verificar que el rol muestre "Estudiante"
4. Verificar que el menú incluya:
   - ✅ Mis Trámites
5. Solo debe ver trámites de su grupo asignado
6. No puede crear, aprobar, rechazar o eliminar trámites

### 6. Consultante
- **Nombre:** Andrés Méndez
- **CI:** 40404040
- **Permisos:** Ver solo sus propios trámites

**Qué probar:**
1. Cerrar sesión del usuario anterior
2. Iniciar sesión con CI: `40404040`
3. Verificar que el rol muestre "Consultante"
4. Verificar que el menú incluya:
   - ✅ Mis Trámites
5. Solo debe ver trámites donde él es el consultante
6. No puede realizar ninguna acción, solo consultar estado

## Verificación de Seguridad

### Pruebas Negativas

1. **Intento de acceso no autorizado:**
   - Iniciar sesión como Admin Docente (nivel 2)
   - En la barra de direcciones, intentar acceder a: `http://localhost:3000` (cambiar vista manualmente en DevTools)
   - Verificar que no se muestran las vistas restringidas

2. **Intento de acción no autorizada:**
   - Iniciar sesión como Admin Administrativo (nivel 1)
   - Verificar que no hay botones de acción en trámites
   - Verificar que no puede acceder a crear trámites o usuarios

3. **Verificación de filtros:**
   - Iniciar sesión como Estudiante
   - Verificar que solo ve trámites de su grupo
   - Iniciar sesión como Consultante
   - Verificar que solo ve sus propios trámites

## Creación de Nuevos Usuarios

1. Iniciar sesión como Admin Sistema (CI: 12345678)
2. Ir a "Crear Usuario"
3. Seleccionar rol "Administrador"
4. Verificar que aparece el selector "Nivel de Acceso"
5. Seleccionar un nivel (1, 2 o 3)
6. Completar el formulario y crear el usuario
7. Verificar en la lista de usuarios que el nivel se muestra correctamente

## Checklist de Funcionalidades

- [ ] Los 3 niveles de administradores muestran diferentes menús
- [ ] Admin Sistema puede gestionar usuarios
- [ ] Admin Docente puede crear y gestionar trámites
- [ ] Admin Administrativo solo puede ver trámites
- [ ] **Módulo de Grupos está visible en el menú lateral**
- [ ] **Admin Sistema y Docente pueden crear grupos**
- [ ] **Admin Administrativo solo puede ver grupos**
- [ ] **Docentes ven solo sus grupos asignados**
- [ ] Docentes ven solo trámites de sus grupos
- [ ] Estudiantes ven solo trámites de su grupo
- [ ] Consultantes ven solo sus propios trámites
- [ ] Los botones de acción se muestran/ocultan según permisos
- [ ] Al crear un administrador, el nivel de acceso es obligatorio
- [ ] La etiqueta del rol muestra el nivel específico del administrador
- [ ] Los intentos de acceso no autorizado son bloqueados
- [ ] **Formulario de crear grupo usa rol unificado 'docente'**
- [ ] **Validación de mínimo 2 asistentes funciona**

## Notas Adicionales

- **Auto-refresh:** Las listas se actualizan automáticamente cada 30 segundos
- **Expansión de filas:** Haz clic en cualquier fila para ver más detalles
- **Logout:** Usa el botón de logout en el sidebar para cambiar de usuario
- **Persistencia:** La sesión se guarda en localStorage (se mantiene al recargar)

## Problemas Conocidos

Si encuentras algún problema:
1. Abre la consola del navegador (F12)
2. Verifica si hay errores en la consola
3. Verifica que todos los contenedores estén corriendo: `docker-compose ps`
4. Revisa los logs del backend: `docker logs sgst_backend`

