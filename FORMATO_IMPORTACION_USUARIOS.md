# Formato de Importación de Usuarios desde Excel

Este documento explica cómo preparar un archivo Excel para importar usuarios al sistema SGST.

## Formato del Archivo

El archivo debe ser un archivo Excel (`.xls` o `.xlsx`) con las siguientes características:

### Estructura

- **Primera fila**: Debe contener los nombres de las columnas (encabezados)
- **Filas siguientes**: Cada fila representa un usuario a importar
- **Nombres de columnas**: No son case-sensitive (pueden estar en mayúsculas o minúsculas)

### Columnas Requeridas

| Columna | Descripción | Ejemplo | Validaciones |
|---------|-------------|---------|--------------|
| `nombre` | Nombre completo del usuario | Juan Pérez | Requerido, no puede estar vacío |
| `ci` | Cédula de identidad | 12345678 | Requerido, debe ser único en el sistema |
| `domicilio` | Dirección del usuario | Av. Principal 123 | Requerido, no puede estar vacío |
| `telefono` | Número de teléfono | 099123456 | Requerido, no puede estar vacío |
| `correo` | Correo electrónico | juan@example.com | Requerido, debe ser único en el sistema, formato de email válido |
| `rol` | Rol del usuario | estudiante, docente, consultante, administrador | Requerido, debe ser uno de los valores válidos |

### Columnas Opcionales

| Columna | Descripción | Ejemplo | Validaciones |
|---------|-------------|---------|--------------|
| `semestre` | Semestre del estudiante | 2024-1 | Requerido si `rol` es `estudiante` |
| `nivel_acceso` | Nivel de acceso del administrador | 1 o 3 | Requerido si `rol` es `administrador`. Valores válidos: `1` (Administrativo) o `3` (Sistema) |
| `password` | Contraseña del usuario | MiPassword123 | Opcional. Si no se proporciona, se usará `Usuario123` por defecto |

## Roles Válidos

- `estudiante`: Usuario estudiante
- `docente`: Usuario docente
- `consultante`: Usuario consultante
- `administrador`: Usuario administrador

## Niveles de Acceso para Administradores

- `1`: Administrativo (Nivel 1)
- `3`: Sistema (Nivel 3)

## Ejemplo de Archivo Excel

### Ejemplo 1: Estudiante

```
nombre          | ci       | domicilio          | telefono  | correo              | rol        | semestre | nivel_acceso | password
Juan Pérez      | 12345678 | Av. Principal 123 | 099123456 | juan@example.com    | estudiante | 2024-1   |              |
```

### Ejemplo 2: Docente

```
nombre          | ci       | domicilio          | telefono  | correo              | rol     | semestre | nivel_acceso | password
María García    | 87654321 | Calle Sec 456     | 098765432 | maria@example.com   | docente |          |              |
```

### Ejemplo 3: Consultante

```
nombre          | ci       | domicilio          | telefono  | correo              | rol         | semestre | nivel_acceso | password
Carlos López    | 11223344 | Barrio Centro 789 | 097112233 | carlos@example.com  | consultante |          |              |
```

### Ejemplo 4: Administrador Sistema

```
nombre          | ci       | domicilio          | telefono  | correo              | rol           | semestre | nivel_acceso | password
Admin Sistema   | 11111111 | Dirección Admin   | 097111111 | admin@example.com   | administrador |          | 3            |
```

### Ejemplo 5: Administrador Administrativo

```
nombre                | ci       | domicilio          | telefono  | correo              | rol           | semestre | nivel_acceso | password
Admin Administrativo  | 22222222 | Dirección Admin   | 097222222 | admin2@example.com  | administrador |          | 1            |
```

## Archivo de Ejemplo

Se incluye un archivo `ejemplo_usuarios.csv` que puedes abrir en Excel y usar como plantilla. Para usarlo:

1. Abre el archivo `ejemplo_usuarios.csv` en Excel
2. Modifica los datos según tus necesidades
3. Guarda el archivo como Excel (`.xlsx`)
4. Importa el archivo desde el sistema

## Validaciones del Sistema

El sistema realizará las siguientes validaciones:

1. **Columnas requeridas**: Verifica que todas las columnas requeridas estén presentes
2. **Datos vacíos**: Verifica que los campos requeridos no estén vacíos
3. **Rol válido**: Verifica que el rol sea uno de los valores válidos
4. **Semestre para estudiantes**: Verifica que los estudiantes tengan semestre
5. **Nivel de acceso para administradores**: Verifica que los administradores tengan nivel_acceso (1 o 3)
6. **CI único**: Verifica que el CI no exista ya en el sistema
7. **Correo único**: Verifica que el correo no exista ya en el sistema
8. **Formato de correo**: Verifica que el correo tenga un formato válido

## Resultados de la Importación

Después de importar, el sistema mostrará:

- **Total de filas procesadas**: Número total de usuarios en el archivo
- **Exitosos**: Número de usuarios creados exitosamente
- **Errores**: Número de usuarios que no pudieron ser creados
- **Detalles**: Lista detallada de cada usuario con su estado (éxito o error)

### Ejemplo de Resultado

```
Total: 10
Exitosos: 8
Errores: 2

Detalles de Errores:
- Fila 3: Juan Pérez - Usuario ya existe (CI: 12345678 o correo: juan@example.com)
- Fila 7: María García - El semestre es requerido para estudiantes
```

## Notas Importantes

1. **Contraseñas por defecto**: Si no se proporciona contraseña, se usará `Usuario123` por defecto. Se recomienda que los usuarios cambien su contraseña después del primer inicio de sesión.

2. **Usuarios duplicados**: Si un usuario con el mismo CI o correo ya existe en el sistema, no se creará y se reportará como error.

3. **Nombres de columnas**: Los nombres de las columnas no son case-sensitive. Puedes usar `Nombre`, `NOMBRE`, `nombre`, etc.

4. **Formato de fecha**: No se requiere formato de fecha especial, ya que las fechas se generan automáticamente.

5. **Tamaño del archivo**: El archivo no debe exceder 5MB.

6. **Formato de archivo**: Solo se aceptan archivos Excel (`.xls`, `.xlsx`).

## Solución de Problemas

### Error: "Faltan columnas requeridas"

**Solución**: Verifica que la primera fila contenga todos los nombres de columnas requeridos: `nombre`, `ci`, `domicilio`, `telefono`, `correo`, `rol`.

### Error: "Rol inválido"

**Solución**: Verifica que el rol sea uno de los valores válidos: `estudiante`, `docente`, `consultante`, `administrador`.

### Error: "El semestre es requerido para estudiantes"

**Solución**: Si el rol es `estudiante`, asegúrate de incluir el campo `semestre` con un valor válido.

### Error: "nivel_acceso es requerido para administradores"

**Solución**: Si el rol es `administrador`, asegúrate de incluir el campo `nivel_acceso` con valor `1` o `3`.

### Error: "Usuario ya existe"

**Solución**: El CI o correo del usuario ya existe en el sistema. Verifica que no estés intentando importar usuarios duplicados.

## Contacto

Si tienes problemas con la importación, contacta al administrador del sistema.


