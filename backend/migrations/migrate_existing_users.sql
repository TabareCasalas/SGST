-- Script de migración para actualizar usuarios con roles antiguos al nuevo sistema
-- Este script convierte los roles específicos al sistema unificado con nivel_acceso

-- PASO 1: Migrar administradores
-- administrador_sistema → administrador con nivel_acceso = 3
UPDATE "Usuario"
SET rol = 'administrador', nivel_acceso = 3
WHERE rol = 'administrador_sistema';

-- administrador_docente → administrador con nivel_acceso = 2
UPDATE "Usuario"
SET rol = 'administrador', nivel_acceso = 2
WHERE rol = 'administrador_docente';

-- administrador_administrativo → administrador con nivel_acceso = 1
UPDATE "Usuario"
SET rol = 'administrador', nivel_acceso = 1
WHERE rol = 'administrador_administrativo';

-- PASO 2: Migrar docentes
-- docente_responsable y docente_asistente → docente
UPDATE "Usuario"
SET rol = 'docente'
WHERE rol IN ('docente_responsable', 'docente_asistente');

-- NOTA: La diferenciación de responsables y asistentes ahora se hace 
-- a través de la tabla UsuarioGrupo con el campo rol_en_grupo

-- PASO 3: Verificar la migración
SELECT 
  id_usuario, 
  nombre, 
  ci, 
  rol, 
  nivel_acceso,
  CASE 
    WHEN rol = 'administrador' AND nivel_acceso = 3 THEN 'Admin. Sistema'
    WHEN rol = 'administrador' AND nivel_acceso = 2 THEN 'Admin. Docente'
    WHEN rol = 'administrador' AND nivel_acceso = 1 THEN 'Admin. Administrativo'
    WHEN rol = 'docente' THEN 'Docente'
    WHEN rol = 'estudiante' THEN 'Estudiante'
    WHEN rol = 'consultante' THEN 'Consultante'
    ELSE 'Otro'
  END as tipo_usuario
FROM "Usuario"
ORDER BY rol, nivel_acceso DESC NULLS LAST;

-- PASO 4 (Opcional): Verificar que no queden roles antiguos
SELECT rol, COUNT(*) as cantidad
FROM "Usuario"
GROUP BY rol
ORDER BY rol;

