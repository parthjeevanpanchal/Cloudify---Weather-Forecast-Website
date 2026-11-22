@echo off
setlocal enabledelayedexpansion
title Cloudify - Weather Forecast App

cd /d "%~dp0"

echo ========================================================
echo   Starting Cloudify Weather Forecast Web App...
echo ========================================================
echo.

:: Check if node is in PATH, otherwise append known installation paths
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if exist "%LOCALAPPDATA%\nodejs\node.exe" (
        set "PATH=%LOCALAPPDATA%\nodejs;%PATH%"
    ) else if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    ) else if exist "%USERPROFILE%\.gemini\antigravity\bin\node.exe" (
        set "PATH=%USERPROFILE%\.gemini\antigravity\bin;%PATH%"
    )
)

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js was not found in your PATH or standard install directories.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

:: Automatically launch the default browser after 2 seconds
echo [INFO] Launching browser at http://localhost:5173/ ...
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5173"

:: Start the Vite development server
echo [INFO] Starting Vite development server...
echo Press Ctrl+C in this window anytime to stop the server.
echo.
call npm run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Server stopped with an error code: %ERRORLEVEL%
    pause
)
