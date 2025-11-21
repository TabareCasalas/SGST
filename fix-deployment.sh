#!/bin/bash

# Script para solucionar problemas de espacio y cache en el deployment
# Uso: ./fix-deployment.sh

set -e

echo "========================================="
echo "Solución de Problemas de Deployment"
echo "========================================="

# 1. Verificar espacio en disco
echo ""
echo "[1] Verificando espacio en disco..."
df -h /
echo ""

# 2. Limpiar TODO Docker (muy agresivo)
echo "[2] Limpiando Docker completamente..."
docker system prune -af --volumes 2>/dev/null || sudo docker system prune -af --volumes 2>/dev/null || true
docker builder prune -af 2>/dev/null || sudo docker builder prune -af 2>/dev/null || true

# Limpiar todas las imágenes
docker image prune -af 2>/dev/null || sudo docker image prune -af 2>/dev/null || true

# Limpiar todos los contenedores
docker container prune -af 2>/dev/null || sudo docker container prune -af 2>/dev/null || true

# Limpiar todos los volúmenes
docker volume prune -af 2>/dev/null || sudo docker volume prune -af 2>/dev/null || true

# Limpiar build cache completamente
docker builder prune -af 2>/dev/null || sudo docker builder prune -af 2>/dev/null || true

echo "Docker limpiado completamente"
echo ""

# 3. Limpiar sistema
echo "[3] Limpiando sistema..."
apt-get autoremove -y -qq 2>/dev/null || true
apt-get autoclean -qq 2>/dev/null || true
apt-get clean -qq 2>/dev/null || true

# Limpiar logs
journalctl --vacuum-time=1d 2>/dev/null || true

# Limpiar temporales
rm -rf /tmp/* 2>/dev/null || true
rm -rf /var/tmp/* 2>/dev/null || true

echo "Sistema limpiado"
echo ""

# 4. Verificar espacio después de limpiar
echo "[4] Espacio disponible después de limpiar:"
df -h /
echo ""

# 5. Verificar que los Dockerfiles estén actualizados
echo "[5] Verificando Dockerfiles..."
cd /opt/sgst

if grep -q "node:18" Dockerfile 2>/dev/null; then
    echo "⚠ ADVERTENCIA: Dockerfile del frontend todavía usa Node 18"
    echo "Actualizando a Node 20..."
    sed -i 's/node:18-alpine/node:20-alpine/g' Dockerfile
fi

if grep -q "node:18" backend/Dockerfile 2>/dev/null; then
    echo "⚠ ADVERTENCIA: Dockerfile del backend todavía usa Node 18"
    sed -i 's/node:18-alpine/node:20-alpine/g' backend/Dockerfile
fi

if grep -q "node:18" orchestrator/Dockerfile 2>/dev/null; then
    echo "⚠ ADVERTENCIA: Dockerfile del orchestrator todavía usa Node 18"
    sed -i 's/node:18-alpine/node:20-alpine/g' orchestrator/Dockerfile
fi

echo "✓ Dockerfiles verificados"
echo ""

# 6. Verificar espacio disponible
AVAILABLE=$(df / | tail -1 | awk '{print $4}')
AVAILABLE_GB=$((AVAILABLE / 1024 / 1024))

echo "Espacio disponible: ${AVAILABLE_GB}GB"
if [ $AVAILABLE_GB -lt 3 ]; then
    echo ""
    echo "⚠ ADVERTENCIA: Menos de 3GB disponibles"
    echo "El build puede fallar por falta de espacio"
    echo ""
    echo "Opciones:"
    echo "1. Aumentar el tamaño del disco en Google Cloud"
    echo "2. Construir las imágenes en otra máquina y subirlas"
    echo "3. Intentar construir de todas formas (puede fallar)"
    echo ""
    read -p "¿Continuar de todas formas? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "========================================="
echo "Listo para reconstruir"
echo "========================================="
echo ""
echo "Ejecuta ahora:"
echo "  cd /opt/sgst"
echo "  docker compose build --no-cache"
echo "  docker compose up -d"
echo ""

