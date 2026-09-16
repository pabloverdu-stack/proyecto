@echo off
rem Doble clic para apagar la web que abriste con "Abrir web.cmd".
cd /d "%~dp0"
if exist ".tools\node\node.exe" set "PATH=%~dp0.tools\node;%PATH%"
call npx astro dev stop
echo.
echo Web apagada.
pause
