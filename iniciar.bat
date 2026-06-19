@echo off
title BOT ALMOXARIFADO
cd /d "%~dp0"
node index.js
if errorlevel 1 (
  echo.
  echo [ERRO] O bot encerrou com erro. Verifique a mensagem acima.
  pause
)
