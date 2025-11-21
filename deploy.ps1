# Script de deployment para Windows PowerShell
# Uso: .\deploy.ps1 [usuario] [ip]

param(
    [string]$Usuario = $env:USERNAME,
    [string]$IP = "35.199.81.198"
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Automatizado SGST" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Servidor: ${Usuario}@${IP}"
Write-Host ""

# Verificar que el script deploy.sh existe
if (-not (Test-Path "deploy.sh")) {
    Write-Host "Error: No se encuentra el archivo deploy.sh" -ForegroundColor Red
    Write-Host "Asegúrate de ejecutar este script desde el directorio raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Verificar conexión SSH
Write-Host "[Verificando conexión SSH...]" -ForegroundColor Yellow
try {
    $result = ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "${Usuario}@${IP}" "echo 'OK'" 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Error de conexión"
    }
    Write-Host "✓ Conexión SSH exitosa" -ForegroundColor Green
} catch {
    Write-Host "Error: No se pudo conectar al servidor" -ForegroundColor Red
    Write-Host "Asegúrate de que:" -ForegroundColor Yellow
    Write-Host "  1. El servidor esté accesible"
    Write-Host "  2. Tengas acceso SSH configurado"
    Write-Host "  3. La IP sea correcta: ${IP}"
    exit 1
}

# Copiar el script al servidor y ejecutarlo
Write-Host ""
Write-Host "[Copiando script al servidor...]" -ForegroundColor Yellow

# Crear un script temporal que incluya todo el contenido
$tempScript = [System.IO.Path]::GetTempFileName()
Copy-Item "deploy.sh" $tempScript

# Copiar al servidor
scp $tempScript "${Usuario}@${IP}:/tmp/deploy.sh" 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al copiar el script. Intentando ejecutar directamente..." -ForegroundColor Yellow
    
    # Si scp falla, intentar ejecutar directamente via SSH con el contenido del script
    Write-Host "Ejecutando deployment directamente..." -ForegroundColor Yellow
    Get-Content "deploy.sh" | ssh "${Usuario}@${IP}" "bash -s"
} else {
    # Ejecutar el script en el servidor
    Write-Host "[Ejecutando deployment en el servidor...]" -ForegroundColor Yellow
    ssh "${Usuario}@${IP}" "chmod +x /tmp/deploy.sh && bash /tmp/deploy.sh"
}

# Limpiar
Remove-Item $tempScript -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Proceso completado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "La aplicación debería estar disponible en:" -ForegroundColor Cyan
Write-Host "  Frontend: http://${IP}" -ForegroundColor White
Write-Host "  Backend: http://${IP}:3001" -ForegroundColor White
Write-Host ""

