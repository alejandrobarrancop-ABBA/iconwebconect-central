@echo off
title ICON-SYNC-AGENT
color 0A
cd /d "%~dp0"

echo ===================================================
echo     INICIANDO AGENTE LOCAL DE SINCRONIZACION
echo               ICON-SYNC-AGENT
echo ===================================================
echo.

if not exist node_modules (
    echo Instalando dependencias necesarias...
    call npm install
)

node index.js
pause
