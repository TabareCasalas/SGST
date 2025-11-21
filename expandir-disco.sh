#!/bin/bash

# Script para expandir el sistema de archivos después de aumentar el disco
# Uso: ./expandir-disco.sh

set -e

echo "========================================="
echo "Expandiendo Sistema de Archivos"
echo "========================================="

# Verificar espacio actual
echo ""
echo "Espacio antes de expandir:"
df -h /

# Detectar el dispositivo del disco
DISK_DEVICE=$(lsblk -o NAME,TYPE | grep disk | head -1 | awk '{print $1}')
PARTITION=$(lsblk -o NAME,TYPE,MOUNTPOINT | grep -E "part.*/$" | awk '{print $1}')

echo ""
echo "Dispositivo detectado: /dev/${DISK_DEVICE}"
echo "Partición detectada: /dev/${PARTITION}"

# Expandir la partición usando growpart
if command -v growpart &> /dev/null; then
    echo ""
    echo "Expandiendo partición con growpart..."
    growpart /dev/${DISK_DEVICE} ${PARTITION##*[!0-9]} || true
else
    echo ""
    echo "Instalando cloud-guest-utils..."
    apt-get update -qq
    apt-get install -y -qq cloud-guest-utils
    growpart /dev/${DISK_DEVICE} ${PARTITION##*[!0-9]} || true
fi

# Expandir el sistema de archivos
echo ""
echo "Expandiendo sistema de archivos..."
if [[ "$PARTITION" == *"nvme"* ]] || [[ "$PARTITION" == *"xvd"* ]]; then
    # Para discos NVMe o EBS
    resize2fs /dev/${PARTITION} || true
else
    # Para discos SCSI tradicionales
    resize2fs /dev/${PARTITION} || true
fi

# Verificar espacio después de expandir
echo ""
echo "Espacio después de expandir:"
df -h /

echo ""
echo "========================================="
echo "Expansión completada"
echo "========================================="

