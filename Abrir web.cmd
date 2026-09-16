@echo off
rem Doble clic para ver la web en tu ordenador (http://localhost:4321).
cd /d "%~dp0"

if exist ".tools\node\node.exe" set "PATH=%~dp0.tools\node;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo No encuentro Node.js. Instala la version LTS desde https://nodejs.org y vuelve a abrir este archivo.
  pause
  exit /b 1
)

set ASTRO_TELEMETRY_DISABLED=1
if not exist "node_modules" (
  echo Instalando lo necesario. Solo pasa la primera vez y tarda un par de minutos...
  call npm install
)

echo Arrancando la web...
call npx astro dev --port 4321
timeout /t 4 /nobreak >nul
start "" http://localhost:4321

echo.
echo La web esta abierta en http://localhost:4321
echo Puedes cerrar esta ventana. Para apagar la web, haz doble clic en "Parar web.cmd".
pause
