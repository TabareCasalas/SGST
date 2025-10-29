# Estructura Unificada de Docentes

## Cambios Implementados

### 1. Schema de Base de Datos

#### Rol Simplificado
```prisma
rol: String @default("estudiante") 
// Valores: estudiante, docente, consultante, administrador
```

- **Antes**: `docente_responsable`, `docente_asistente`, `administrador_docente`, etc.
- **Ahora**: Solo `docente` como rol base

#### Relación Docente-Grupo (UsuarioGrupo)

```prisma
model UsuarioGrupo {
  id_usuario_grupo    Int       @id @default(autoincrement())
  id_usuario          Int
  id_grupo            Int
  rol_en_grupo        String    // responsable, asistente, estudiante
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  usuario             Usuario   @relation(fields: [id_usuario], references: [id_usuario])
  grupo               Grupo     @relation(fields: [id_grupo], references: [id_grupo])
  
  @@unique([id_usuario, id_grupo])
}
```

### 2. Lógica de Roles

#### Un docente puede ser:
- **Responsable** de un grupo (puede aprobar/rechazar trámites)
- **Asistente** de otro grupo (solo puede ver trámites)
- **Ambos** simultáneamente en diferentes grupos

#### Ejemplo:
```
Docente Juan Pérez (rol: "docente")
  - Grupo A: responsable
  - Grupo B: asistente
  - Grupo C: responsable
```

### 3. Permisos por Rol en Grupo

#### Responsable (`rol_en_grupo: "responsable"`)
- Ver trámites del grupo
- Aprobar trámites en revisión
- Rechazar trámites en revisión
- Agregar observaciones

#### Asistente (`rol_en_grupo: "asistente"`)
- Ver trámites del grupo
- Solo lectura (no puede aprobar/rechazar)

#### Estudiante (`rol_en_grupo: "estudiante"`)
- Ver trámites del grupo
- Solo lectura

### 4. Implementación en Frontend

#### AuthContext
```typescript
export type UserRole = 'admin' | 'docente' | 'estudiante' | 'consultante';

export interface AuthUser {
  //... otros campos
  grupos_participa?: Array<{
    id_grupo: number;
    rol_en_grupo: string;
    grupo: {
      id_grupo: number;
      nombre: string;
    };
  }>;
}
```

#### Filtrado de Trámites
```typescript
if (hasRole('docente') && user?.grupos_participa) {
  const gruposIds = user.grupos_participa.map(gp => gp.id_grupo);
  data = data.filter((t: Tramite) => gruposIds.includes(t.id_grupo));
}
```

#### Control de Acciones
```typescript
// Solo responsables pueden aprobar/rechazar
hasRole('admin') || 
(hasRole('docente') && user?.grupos_participa?.some(
  gp => gp.id_grupo === tramite.id_grupo && gp.rol_en_grupo === 'responsable'
))
```

### 5. API del Backend

#### Endpoints para UsuarioGrupo (próximos)
```
POST   /api/usuario-grupo          - Asignar docente a grupo
GET    /api/usuario-grupo/:id_usuario - Ver grupos de un docente
DELETE /api/usuario-grupo/:id      - Remover docente de grupo
PATCH  /api/usuario-grupo/:id      - Cambiar rol en grupo
```

### 6. Flujo de Trabajo

#### Asignación de Docente a Grupo
1. Admin crea/edita un usuario con `rol: "docente"`
2. Admin asigna al docente a uno o más grupos
3. Para cada grupo, especifica `rol_en_grupo`: "responsable" o "asistente"
4. Docente inicia sesión y ve trámites de sus grupos
5. Si es responsable, puede aprobar/rechazar

#### Cambio de Responsable
1. Admin puede cambiar `rol_en_grupo` de "asistente" a "responsable"
2. Automáticamente el docente obtiene permisos de aprobación
3. Sin necesidad de cambiar el rol base del usuario

### 7. Ventajas del Nuevo Sistema

#### Flexibilidad
- Un docente puede tener diferentes roles en diferentes grupos
- Fácil reasignación de responsabilidades

#### Simplicidad
- Un solo rol "docente" en lugar de múltiples variantes
- Permisos definidos por relación con grupo

#### Escalabilidad
- Agregar nuevos roles en grupo sin modificar roles de usuario
- Histórico de asignaciones preservado

#### Trazabilidad
- Auditoría de quién fue responsable de qué grupo y cuándo
- Timestamps de asignación/remoción

### 8. Datos de Prueba

Para probar el sistema:

```sql
-- Crear un docente
INSERT INTO "Usuario" (nombre, ci, correo, rol, activo)
VALUES ('Prof. María García', '12345678', 'maria@example.com', 'docente', true);

-- Asignar como responsable del Grupo 1
INSERT INTO "UsuarioGrupo" (id_usuario, id_grupo, rol_en_grupo)
VALUES (1, 1, 'responsable');

-- Asignar como asistente del Grupo 2
INSERT INTO "UsuarioGrupo" (id_usuario, id_grupo, rol_en_grupo)
VALUES (1, 2, 'asistente');
```

### 9. Próximos Pasos

1. ✅ Schema actualizado
2. ✅ Frontend actualizado
3. ✅ Filtrado de trámites por grupos del docente
4. ✅ Control de permisos según rol_en_grupo
5. ⏳ Crear endpoints CRUD para UsuarioGrupo
6. ⏳ Agregar UI para gestionar asignaciones docente-grupo
7. ⏳ Implementar vista para docentes con información de sus grupos

## Acceso al Sistema

- Frontend: http://localhost:3000
- Login con CI de usuario con rol "docente"
- Ver trámites de grupos asignados
- Aprobar/rechazar si es responsable del grupo

## Roles Actuales

- **admin**: Acceso total, puede gestionar todo
- **docente**: Ve trámites de sus grupos, aprueba si es responsable
- **estudiante**: Ve solo trámites de su grupo
- **consultante**: Ve solo sus propios trámites

