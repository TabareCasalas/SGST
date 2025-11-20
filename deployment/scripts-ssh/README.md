# Scripts de Deployment desde SSH

Estos scripts están diseñados para ejecutarse directamente desde SSH, clonando el código desde GitHub automáticamente.

## Características

- ✅ Se clonan automáticamente desde GitHub
- ✅ No requieren subir archivos manualmente
- ✅ Se ejecutan directamente desde SSH
- ✅ Instalan todas las dependencias necesarias
- ✅ Configuran servicios systemd
- ✅ Listos para copiar y pegar

## Uso Rápido

Consulta [COMANDOS_COPIAR_PEGAR.md](./COMANDOS_COPIAR_PEGAR.md) para los comandos listos para copiar y pegar.

## Estructura

- `database-deploy.sh` - Deployment de PostgreSQL
- `backend-deploy.sh` - Deployment de Backend Node.js
- `frontend-deploy.sh` - Deployment de Frontend React + Nginx
- `camunda-deploy.sh` - Deployment de Camunda 8

## Requisitos

- Ubuntu 22.04 LTS
- Acceso SSH con sudo
- Conexión a internet (para clonar desde GitHub)

## Orden de Deployment

1. **Base de Datos** (primero)
2. **Camunda** (segundo)
3. **Backend** (tercero)
4. **Frontend** (cuarto)

## Variables de Entorno

Cada script requiere ciertas variables de entorno. Consulta `COMANDOS_COPIAR_PEGAR.md` para ver cómo configurarlas.

## Ejecución Local (Alternativa)

Si prefieres ejecutar los scripts localmente después de clonarlos:

```bash
# Clonar repositorio
git clone -b taba-branch https://github.com/TabareCasalas/SGST.git
cd SGST

# Dar permisos
chmod +x deployment/scripts-ssh/*.sh

# Ejecutar (configurar variables primero)
export DB_PASSWORD="..."
./deployment/scripts-ssh/database-deploy.sh
```

## Troubleshooting

Si los scripts fallan:

1. Verifica que todas las variables estén configuradas
2. Verifica conectividad a internet
3. Verifica que no haya procesos en los puertos
4. Revisa los logs del servicio

Para más detalles, consulta `../TROUBLESHOOTING.md`.

