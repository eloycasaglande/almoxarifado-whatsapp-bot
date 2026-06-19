@echo off
echo.
echo ============================================
echo   GERANDO EXECUTAVEL - ALMOXARIFADO BOT
echo ============================================
echo.

:: Verifica se o Node esta instalado
node -v >nul 2>&1
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado.
  echo        Instale em: https://nodejs.org
  pause
  exit /b
)

:: Instala o PKG globalmente se ainda nao tiver
echo [1/3] Verificando empacotador...
npm list -g pkg >nul 2>&1
if errorlevel 1 (
  echo       Instalando PKG...
  npm install -g pkg
)

:: Instala dependencias do projeto
echo [2/3] Instalando dependencias...
npm install

:: Gera o executavel na pasta dist
echo [3/3] Gerando almoxarifado.exe...
if not exist dist mkdir dist
pkg index.js --targets node18-win-x64 --output dist\almoxarifado.exe

echo.
echo ============================================
echo   PRONTO!
echo   Executavel gerado em: dist\almoxarifado.exe
echo ============================================
echo.
pause
