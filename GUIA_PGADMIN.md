# 🗄️ Guía para usar PgAdmin con SGST

## 🔐 Acceso a PgAdmin

### 1. Acceder a la interfaz
- **URL**: http://localhost:8080
- **Email**: admin@sgst.com
- **Contraseña**: admin123

### 2. Configurar la conexión al servidor PostgreSQL

Una vez dentro de pgAdmin, sigue estos pasos:

#### Paso 1: Agregar nuevo servidor
1. Hacer clic derecho en **"Servers"** en el panel izquierdo
2. Seleccionar **"Register" → "Server"**

#### Paso 2: Configurar la conexión

En la pestaña **"General"**:
- **Name**: `SGST PostgreSQL` (o el nombre que prefieras)

En la pestaña **"Connection"**:
- **Host name/address**: `sgst_postgres` (nombre del contenedor)
- **Port**: `5432`
- **Maintenance database**: `sgst_db`
- **Username**: `sgst_user`
- **Password**: `sgst_password`
- **✅ Save password**: marcar esta casilla

#### Paso 3: Guardar
- Clic en **"Save"**

## 📊 Bases de Datos Disponibles

Una vez conectado, verás dos bases de datos:

### 1. `sgst_db` (Base de datos principal)
- Contiene las tablas de la aplicación SGST
- Tablas:
  - `Usuario`
  - `Consultante`
  - `Grupo`
  - `Tramite`
  - `Notificacion`

### 2. `camunda_db` (Base de datos de Camunda)
- Contiene tablas del motor de procesos
- Tablas automáticas de Camunda:
  - `ACT_RU_*` (Runtime - procesos en ejecución)
  - `ACT_HI_*` (History - histórico de procesos)
  - `ACT_GE_*` (General - recursos generales)
  - etc.

## 🔍 Verificar que las bases existen

Puedes verificar las bases de datos con este comando:

```powershell
docker exec -it sgst_postgres psql -U sgst_user -l
```

Deberías ver:
```
                                  List of databases
    Name     |   Owner   | Encoding |  Collate   |    Ctype    | Access privileges
-------------+-----------+----------+------------+-------------+-------------------
 camunda_db  | sgst_user | UTF8     | en_US.utf8 | en_US.utf8 |
 postgres    | sgst_user | UTF8     | en_US.utf8 | en_US.utf8 |
 sgst_db     | sgst_user | UTF8     | en_US.utf8 | en_US.utf8 |
 template0   | sgst_user | UTF8     | en_US.utf8 | en_US.utf8 |
 template1   | sgst_user | UTF8     | en_US.utf8 | en_US.utf8 |
```

## 🛠️ Solución de Problemas

### Error: "Cannot connect to server"
Si no puedes conectar al servidor:

1. **Verificar que el contenedor está corriendo**:
   ```powershell
   docker-compose ps postgres
   ```

2. **Verificar los logs**:
   ```powershell
   docker-compose logs postgres
   ```

3. **Verificar la red de Docker**:
   ```powershell
   docker network inspect sgst_sgst_network
   ```

### Usar `localhost` en vez de `sgst_postgres`
Si no funciona con `sgst_postgres`, puedes intentar:
- **Host**: `localhost`
- **Port**: `5432`

Pero esto solo funcionará si el contenedor está exponiendo el puerto al host.

## 📝 Credenciales por Defecto

```
Usuario: sgst_user
Contraseña: sgst_password
Puerto: 5432
Base de datos principal: sgst_db
Base de datos Camunda: camunda_db
```

> ⚠️ **Importante**: Estas son credenciales de desarrollo. Cambia las credenciales en producción.

## 🎯 Explorar las Bases de Datos

Una vez conectado, puedes:
- Expandir `SGST PostgreSQL` → `Databases` → `sgst_db` → `Schemas` → `public` → `Tables`
- Ver todas las tablas creadas por Prisma
- Ejecutar consultas SQL
- Ver el contenido de las tablas
- Editar datos directamente

## 🔄 Ejecutar Migraciones

Para crear las tablas en la base de datos:

```powershell
# Ejecutar migraciones de Prisma
docker exec -it sgst_backend npm run prisma:migrate

# O generar Prisma Client
docker exec -it sgst_backend npm run prisma:generate
```

## 📊 Query Editor

Puedes ejecutar consultas SQL desde pgAdmin:
1. Hacer clic derecho en la base de datos
2. Seleccionar **"Query Tool"**
3. Escribir tu consulta SQL
4. Ejecutar con **F5** o el botón de ejecutar

### Ejemplo de consulta
```sql
-- Ver todos los usuarios
SELECT * FROM "Usuario";

-- Ver trámites
SELECT * FROM "Tramite" ORDER BY "fecha_inicio" DESC;

-- Ver consultantes con sus usuarios
SELECT 
  c.id_consultante,
  u.nombre,
  u.ci,
  c.est_civil
FROM "Consultante" c
JOIN "Usuario" u ON c.id_usuario = u.id_usuario;
```

