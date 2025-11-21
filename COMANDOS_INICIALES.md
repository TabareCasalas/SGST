# Comandos Iniciales para Deployment

Este documento contiene los comandos que necesitas ejecutar para desplegar la aplicación SGST en tu servidor de Google Cloud.

## Información del Servidor

- **IP Externa**: 35.199.81.198
- **Sistema Operativo**: Ubuntu (VM en Google Cloud)
- **Repositorio**: https://github.com/TabareCasalas/SGST/tree/taba-branch
- **Rama**: taba-branch

## Opción 1: Desde Windows (PowerShell) - Recomendado

### Paso 1: Abrir PowerShell

Abre PowerShell en el directorio del proyecto:

```powershell
cd C:\Users\taba\Desktop\Proyectos\SGST
```

### Paso 2: Ejecutar el script de deployment

```powershell
.\deploy.ps1 [tu_usuario] [35.199.81.198]
```

**Ejemplo:**
```powershell
.\deploy.ps1 tu_usuario 35.199.81.198
```

Si no especificas parámetros, usará tu usuario actual y la IP por defecto:
```powershell
.\deploy.ps1
```

## Opción 2: Desde Windows usando Git Bash o WSL

### Paso 1: Abrir Git Bash o WSL

Navega al directorio del proyecto:
```bash
cd /c/Users/taba/Desktop/Proyectos/SGST
```

### Paso 2: Hacer el script ejecutable y ejecutarlo

```bash
chmod +x deploy.sh
./deploy.sh [tu_usuario] 35.199.81.198
```

**Ejemplo:**
```bash
./deploy.sh tu_usuario 35.199.81.198
```

## Opción 3: Ejecutar directamente en el servidor (SSH)

### Paso 1: Conectarse al servidor

```bash
ssh tu_usuario@35.199.81.198
```

### Paso 2: Clonar el repositorio

```bash
cd /opt
sudo git clone -b taba-branch https://github.com/TabareCasalas/SGST.git sgst
cd sgst
```

### Paso 3: Hacer el script ejecutable

```bash
chmod +x deploy.sh
```

### Paso 4: Ejecutar el script

```bash
./deploy.sh
```

**Nota**: Si ejecutas el script directamente en el servidor, solo se ejecutará la parte del servidor (la parte de verificación SSH se saltará).

## Comandos Rápidos de Referencia

### Conectarse al servidor
```bash
ssh tu_usuario@35.199.81.198
```

### Ver logs de la aplicación
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose logs -f'
```

### Ver estado de los contenedores
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose ps'
```

### Reiniciar la aplicación
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose restart'
```

### Detener la aplicación
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose down'
```

### Iniciar la aplicación
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose up -d'
```

## Verificación Post-Deployment

Después de ejecutar el script, verifica que todo esté funcionando:

### 1. Verificar contenedores
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose ps'
```

Todos los contenedores deben estar en estado "Up" o "healthy".

### 2. Verificar servicios web

Abre en tu navegador:
- Frontend: http://35.199.81.198
- Backend: http://35.199.81.198:3001/health
- Camunda Operate: http://35.199.81.198:8081

### 3. Ver logs si hay problemas
```bash
ssh tu_usuario@35.199.81.198 'cd /opt/sgst && docker compose logs --tail=50'
```

## Solución de Problemas Comunes

### Error: "Permission denied" al conectar por SSH

Asegúrate de tener tu clave SSH configurada en Google Cloud:
```bash
# En tu máquina local, copiar clave pública
cat ~/.ssh/id_rsa.pub
# Luego agregarla en Google Cloud Console > Compute Engine > Metadata > SSH Keys
```

### Error: "Cannot connect to Docker daemon"

Si ejecutas comandos manualmente y obtienes este error:
```bash
ssh tu_usuario@35.199.81.198
sudo systemctl start docker
sudo usermod -aG docker $USER
# Cerrar sesión y volver a conectar
```

### Error: "Port already in use"

Si un puerto está en uso:
```bash
ssh tu_usuario@35.199.81.198
cd /opt/sgst
docker compose down
# Esperar unos segundos
docker compose up -d
```

## Tiempo Estimado

El deployment completo puede tardar:
- **Primera vez**: 15-30 minutos (instalación de Docker, descarga de imágenes, compilación)
- **Actualizaciones**: 5-10 minutos (solo actualización de código e imágenes)

## Próximos Pasos

Una vez completado el deployment:

1. ✅ Verificar que todos los servicios estén corriendo
2. ✅ Acceder al frontend y probar la aplicación
3. ✅ Configurar variables de entorno personalizadas si es necesario
4. ✅ Configurar dominio personalizado (opcional)
5. ✅ Configurar SSL/HTTPS (recomendado para producción)

## Notas Importantes

- ⚠️ El script genera automáticamente secrets aleatorios para JWT y otros tokens
- ⚠️ Las contraseñas por defecto están en el archivo `.env` - cámbialas en producción
- ⚠️ PgAdmin está expuesto públicamente - considera restringir el acceso
- ⚠️ El servidor e2-mini tiene recursos limitados - monitorea el uso

