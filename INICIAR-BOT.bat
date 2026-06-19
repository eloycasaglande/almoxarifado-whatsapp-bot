@echo off
chcp 65001 >nul
title BOT ALMOXARIFADO
color 0A

REM Vai para a pasta onde este arquivo esta (funciona em qualquer lugar)
cd /d "%~dp0"

REM Verifica se o Node.js esta instalado
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo  [ERRO] Node.js nao encontrado neste computador.
    echo  Instale em: https://nodejs.org
    echo.
    pause
    exit /b
)

:loop
cls
echo  Iniciando o bot do almoxarifado...
echo.
node index.js

REM Se o bot cair (internet, erro, etc), reinicia sozinho em 5 segundos
echo.
echo  O bot parou. Reiniciando em 5 segundos...
echo  (Para encerrar de vez, feche esta janela)
timeout /t 5 >nul
goto loop
