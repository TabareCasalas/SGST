#!/bin/bash

# Script maestro para deployment completo de SGST
# Ejecutar desde el directorio raíz del proyecto

set -e

echo "========================================="
echo "Deployment Completo de SGST"
echo "========================================="

# Cargar configuración
if [ -f "deployment/config.env" ]; then
    source deployment/config.env
else
    echo "Error: Archivo deployment/config.env no encontrado"
    echo "Crea el archivo config.env basándote en config.env.example"
    exit 1
fi

# Verificar que todas las variables estén configuradas
REQUIRED_VARS=(
    "DB_SERVER_HOST"
    "DB_SERVER_USER"
    "BACKEND_SERVER_HOST"
    "BACKEND_SERVER_USER"
    "FRONTEND_SERVER_HOST"
    "FRONTEND_SERVER_USER"
    "CAMUNDA_SERVER_HOST"
    "CAMUNDA_SERVER_USER"
    "DB_PASSWORD"
    "JWT_SECRET"
    "REFRESH_SECRET"
    "ORCHESTRATOR_TOKEN"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Variable $var no está configurada en config.env"
        exit 1
    fi
done

echo "Configuración cargada correctamente"
echo ""

# Menú de opciones
echo "Selecciona qué desplegar:"
echo "1) Todo (Base de datos, Backend, Frontend, Camunda)"
echo "2) Solo Base de datos"
echo "3) Solo Backend"
echo "4) Solo Frontend"
echo "5) Solo Camunda"
echo "6) Backend + Frontend (sin reiniciar DB y Camunda)"
read -p "Opción [1-6]: " option

case $option in
    1)
        echo "Desplegando todo..."
        DEPLOY_DB=true
        DEPLOY_BACKEND=true
        DEPLOY_FRONTEND=true
        DEPLOY_CAMUNDA=true
        ;;
    2)
        echo "Desplegando solo Base de datos..."
        DEPLOY_DB=true
        DEPLOY_BACKEND=false
        DEPLOY_FRONTEND=false
        DEPLOY_CAMUNDA=false
        ;;
    3)
        echo "Desplegando solo Backend..."
        DEPLOY_DB=false
        DEPLOY_BACKEND=true
        DEPLOY_FRONTEND=false
        DEPLOY_CAMUNDA=false
        ;;
    4)
        echo "Desplegando solo Frontend..."
        DEPLOY_DB=false
        DEPLOY_BACKEND=false
        DEPLOY_FRONTEND=true
        DEPLOY_CAMUNDA=false
        ;;
    5)
        echo "Desplegando solo Camunda..."
        DEPLOY_DB=false
        DEPLOY_BACKEND=false
        DEPLOY_FRONTEND=false
        DEPLOY_CAMUNDA=true
        ;;
    6)
        echo "Desplegando Backend + Frontend..."
        DEPLOY_DB=false
        DEPLOY_BACKEND=true
        DEPLOY_FRONTEND=true
        DEPLOY_CAMUNDA=false
        ;;
    *)
        echo "Opción inválida"
        exit 1
        ;;
esac

# Deployment de Base de datos
if [ "$DEPLOY_DB" = true ]; then
    echo ""
    echo "========================================="
    echo "1. Deployment de Base de Datos"
    echo "========================================="
    
    read -p "¿Es la primera vez que despliegas la base de datos? (s/n): " first_time
    
    if [ "$first_time" = "s" ]; then
        echo "Subiendo archivos de instalación..."
        scp -r deployment/servidor-database/* ${DB_SERVER_USER}@${DB_SERVER_HOST}:/tmp/sgst-db/
        
        echo "Ejecutando instalación..."
        ssh ${DB_SERVER_USER}@${DB_SERVER_HOST} <<EOF
cd /tmp/sgst-db
chmod +x install.sh
sudo bash install.sh
EOF
    else
        echo "Saltando instalación inicial de base de datos..."
    fi
fi

# Deployment de Camunda
if [ "$DEPLOY_CAMUNDA" = true ]; then
    echo ""
    echo "========================================="
    echo "2. Deployment de Camunda"
    echo "========================================="
    
    read -p "¿Es la primera vez que despliegas Camunda? (s/n): " first_time
    
    if [ "$first_time" = "s" ]; then
        echo "Subiendo archivos de instalación..."
        scp -r deployment/servidor-camunda/* ${CAMUNDA_SERVER_USER}@${CAMUNDA_SERVER_HOST}:/tmp/sgst-camunda/
        scp -r orchestrator/* ${CAMUNDA_SERVER_USER}@${CAMUNDA_SERVER_HOST}:/tmp/sgst-camunda/orchestrator/
        scp -r camunda/diagrams/* ${CAMUNDA_SERVER_USER}@${CAMUNDA_SERVER_HOST}:/tmp/sgst-camunda/diagrams/
        
        echo "Configurando variables de entorno..."
        ssh ${CAMUNDA_SERVER_USER}@${CAMUNDA_SERVER_HOST} <<EOF
export DB_HOST="${DB_SERVER_HOST}"
export DB_PORT="5432"
export DB_NAME="camunda_db"
export DB_USER="sgst_user"
export DB_PASSWORD="${DB_PASSWORD}"
export BACKEND_URL="http://${BACKEND_SERVER_HOST}:3001"
export ORCHESTRATOR_TOKEN="${ORCHESTRATOR_TOKEN}"
cd /tmp/sgst-camunda
chmod +x install.sh
sudo bash install.sh
EOF
    else
        echo "Actualizando orchestrator..."
        scp -r orchestrator/* ${CAMUNDA_SERVER_USER}@${CAMUNDA_SERVER_HOST}:/opt/sgst-camunda/orchestrator/
        ssh ${CAMUNDA_SERVER_USER}@${CAMUNDA_SERVER_HOST} <<EOF
cd /opt/sgst-camunda
sudo -u sgst docker-compose restart orchestrator
EOF
    fi
fi

# Deployment de Backend
if [ "$DEPLOY_BACKEND" = true ]; then
    echo ""
    echo "========================================="
    echo "3. Deployment de Backend"
    echo "========================================="
    
    read -p "¿Es la primera vez que despliegas el backend? (s/n): " first_time
    
    if [ "$first_time" = "s" ]; then
        echo "Subiendo archivos de instalación..."
        scp -r deployment/servidor-backend/* ${BACKEND_SERVER_USER}@${BACKEND_SERVER_HOST}:/tmp/sgst-backend/
        scp -r backend/* ${BACKEND_SERVER_USER}@${BACKEND_SERVER_HOST}:/tmp/sgst-backend/
        
        echo "Configurando variables de entorno..."
        ssh ${BACKEND_SERVER_USER}@${BACKEND_SERVER_HOST} <<EOF
export DB_HOST="${DB_SERVER_HOST}"
export DB_PORT="5432"
export DB_NAME="sgst_db"
export DB_USER="sgst_user"
export DB_PASSWORD="${DB_PASSWORD}"
export ORCHESTRATOR_URL="http://${CAMUNDA_SERVER_HOST}:3002"
export ORCHESTRATOR_TOKEN="${ORCHESTRATOR_TOKEN}"
export JWT_SECRET="${JWT_SECRET}"
export REFRESH_SECRET="${REFRESH_SECRET}"
cd /tmp/sgst-backend
chmod +x install.sh
sudo bash install.sh
EOF
    else
        echo "Ejecutando deployment..."
        export SERVER_USER="${BACKEND_SERVER_USER}"
        export SERVER_HOST="${BACKEND_SERVER_HOST}"
        chmod +x deployment/servidor-backend/deploy.sh
        ./deployment/servidor-backend/deploy.sh
    fi
fi

# Deployment de Frontend
if [ "$DEPLOY_FRONTEND" = true ]; then
    echo ""
    echo "========================================="
    echo "4. Deployment de Frontend"
    echo "========================================="
    
    read -p "¿Es la primera vez que despliegas el frontend? (s/n): " first_time
    
    if [ "$first_time" = "s" ]; then
        echo "Subiendo archivos de instalación..."
        scp -r deployment/servidor-frontend/* ${FRONTEND_SERVER_USER}@${FRONTEND_SERVER_HOST}:/tmp/sgst-frontend/
        scp -r frontend/* ${FRONTEND_SERVER_USER}@${FRONTEND_SERVER_HOST}:/tmp/sgst-frontend/
        
        echo "Configurando variables de entorno..."
        ssh ${FRONTEND_SERVER_USER}@${FRONTEND_SERVER_HOST} <<EOF
export BACKEND_URL="http://${BACKEND_SERVER_HOST}:3001"
cd /tmp/sgst-frontend
chmod +x install.sh
sudo bash install.sh
EOF
    else
        echo "Ejecutando deployment..."
        export SERVER_USER="${FRONTEND_SERVER_USER}"
        export SERVER_HOST="${FRONTEND_SERVER_HOST}"
        export BACKEND_URL="http://${BACKEND_SERVER_HOST}:3001"
        chmod +x deployment/servidor-frontend/deploy.sh
        ./deployment/servidor-frontend/deploy.sh
    fi
fi

echo ""
echo "========================================="
echo "Deployment completado"
echo "========================================="
echo ""
echo "Verificar servicios:"
echo "  Base de datos: ssh ${DB_SERVER_USER}@${DB_SERVER_HOST} 'sudo systemctl status postgresql'"
echo "  Backend: ssh ${BACKEND_SERVER_USER}@${BACKEND_SERVER_HOST} 'sudo systemctl status sgst-backend'"
echo "  Frontend: ssh ${FRONTEND_SERVER_USER}@${FRONTEND_SERVER_HOST} 'sudo systemctl status nginx'"
echo "  Camunda: ssh ${CAMUNDA_SERVER_USER}@${CAMUNDA_SERVER_HOST} 'sudo -u sgst docker-compose -f /opt/sgst-camunda/docker-compose.yml ps'"
echo ""
echo "URLs de acceso:"
echo "  Frontend: http://${FRONTEND_SERVER_HOST}"
echo "  Backend API: http://${BACKEND_SERVER_HOST}:3001"
echo "  Camunda Operate: http://${CAMUNDA_SERVER_HOST}:8081"
echo "========================================="

