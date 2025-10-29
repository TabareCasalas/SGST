-- Script de migración para asignar niveles de acceso a administradores existentes
-- Ejecutar este script después de aplicar el cambio en el schema

-- Ver administradores sin nivel de acceso asignado
SELECT id_usuario, nombre, ci, correo, rol, nivel_acceso
FROM "Usuario"
WHERE rol = 'administrador';

-- Ejemplo: Asignar nivel 3 (Sistema) al primer administrador
-- UPDATE "Usuario" 
-- SET nivel_acceso = 3 
-- WHERE id_usuario = 1 AND rol = 'administrador';

-- Ejemplo: Asignar nivel 2 (Docente) a un administrador específico por CI
-- UPDATE "Usuario" 
-- SET nivel_acceso = 2 
-- WHERE ci = '12345678' AND rol = 'administrador';

-- Ejemplo: Asignar nivel 1 (Administrativo) a todos los admins sin nivel
-- UPDATE "Usuario" 
-- SET nivel_acceso = 1 
-- WHERE rol = 'administrador' AND nivel_acceso IS NULL;

-- Verificar los cambios
SELECT id_usuario, nombre, ci, rol, nivel_acceso,
  CASE 
    WHEN nivel_acceso = 3 THEN 'Admin. Sistema'
    WHEN nivel_acceso = 2 THEN 'Admin. Docente'
    WHEN nivel_acceso = 1 THEN 'Admin. Administrativo'
    ELSE 'Sin nivel asignado'
  END as tipo_admin
FROM "Usuario"
WHERE rol = 'administrador'
ORDER BY nivel_acceso DESC NULLS LAST;

