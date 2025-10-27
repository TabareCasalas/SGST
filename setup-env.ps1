# Script para configurar el archivo .env
# Ejecuta este script para crear el archivo .env desde env.example

if (Test-Path .env) {
    Write-Host "El archivo .env ya existe." -ForegroundColor Yellow
    Write-Host "Si deseas recrearlo, elimínalo primero o edítalo manualmente." -ForegroundColor Yellow
} else {
    Write-Host "Creando archivo .env desde env.example..." -ForegroundColor Green
    Copy-Item env.example .env
    Write-Host "✅ Archivo .env creado exitosamente." -ForegroundColor Green
    Write-Host ""
    Write-Host "Puedes editar el archivo .env con: notepad .env" -ForegroundColor Cyan
}

