# Quick Start - Deployment SGST

Guía rápida para desplegar SGST en Google Cloud.

## Paso 1: Preparar Servidores

Crea 4 instancias de VM en Google Cloud:

1. **Base de Datos**: Ubuntu 22.04, mínimo 2GB RAM, 20GB disco
2. **Backend**: Ubuntu 22.04, mínimo 2GB RAM, 10GB disco
3. **Frontend**: Ubuntu 22.04, mínimo 1GB RAM, 5GB disco
4. **Camunda**: Ubuntu 22.04, mínimo 4GB RAM, 30GB disco

## Paso 2: Configurar Firewall

En Google Cloud Console, crea reglas de firewall:

- **Base de datos**: Puerto 5432 (solo desde Backend y Camunda)
- **Backend**: Puerto 3001 (desde Frontend)
- **Frontend**: Puertos 80, 443 (público)
- **Camunda**: Puertos 26500, 8081, 8082, 8083, 3002 (desde Backend)

## Paso 3: Configurar Variables

```bash
# Copiar archivo de ejemplo
cp deployment/config.env.example deployment/config.env

# Editar con tus valores
nano deployment/config.env
```

Completa:
- IPs de los servidores
- Usuarios SSH
- Contraseñas y secrets

## Paso 4: Ejecutar Deployment

```bash
# Dar permisos de ejecución
chmod +x deployment/deploy-all.sh
chmod +x deployment/servidor-*/install.sh
chmod +x deployment/servidor-*/deploy.sh

# Ejecutar deployment completo
./deployment/deploy-all.sh
```

Selecciona opción `1` para desplegar todo.

## Paso 5: Verificar

```bash
# Frontend
curl http://<IP_FRONTEND>

# Backend
curl http://<IP_BACKEND>:3001/health

# Camunda
curl http://<IP_CAMUNDA>:8081/actuator/health
```

## Orden de Deployment Manual

Si prefieres hacerlo manualmente:

1. **Base de datos** (primero)
   ```bash
   cd deployment/servidor-database
   # Seguir README.md
   ```

2. **Camunda** (segundo)
   ```bash
   cd deployment/servidor-camunda
   # Seguir README.md
   ```

3. **Backend** (tercero)
   ```bash
   cd deployment/servidor-backend
   # Seguir README.md
   ```

4. **Frontend** (cuarto)
   ```bash
   cd deployment/servidor-frontend
   # Seguir README.md
   ```

## Troubleshooting

Consulta [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para problemas comunes.

## Próximos Pasos

1. Configurar SSL/TLS para el frontend
2. Configurar backups automáticos
3. Configurar monitoreo
4. Optimizar recursos según carga

