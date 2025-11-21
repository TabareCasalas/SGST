#!/bin/bash

# Script para limpiar espacio en disco antes del deployment
# Uso: ./limpiar-espacio.sh

set -e

echo "========================================="
echo "Limpiando espacio en disco"
echo "========================================="

# Verificar espacio actual
echo "Espacio disponible antes de limpiar:"
df -h /

# Limpiar paquetes no utilizados
echo ""
echo "[1] Limpiando paquetes no utilizados..."
apt-get autoremove -y
apt-get autoclean -y

# Limpiar cache de apt
echo ""
echo "[2] Limpiando cache de apt..."
apt-get clean

# Limpiar logs antiguos
echo ""
echo "[3] Limpiando logs antiguos..."
journalctl --vacuum-time=3d 2>/dev/null || true
find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true

# Limpiar Docker (si está instalado)
if command -v docker &> /dev/null; then
    echo ""
    echo "[4] Limpiando Docker..."
    docker system prune -af --volumes 2>/dev/null || true
    docker builder prune -af 2>/dev/null || true
fi

# Limpiar archivos temporales
echo ""
echo "[5] Limpiando archivos temporales..."
rm -rf /tmp/* 2>/dev/null || true
rm -rf /var/tmp/* 2>/dev/null || true

# Verificar espacio después de limpiar
echo ""
echo "Espacio disponible después de limpiar:"
df -h /

echo ""
echo "========================================="
echo "Limpieza completada"
echo "========================================="

