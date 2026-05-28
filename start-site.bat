@echo off
setlocal
title Couple Site Preview - keep this window open
cd /d "%~dp0"

set "NODE_EXE=C:\Users\13770\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
echo.
echo Couple site preview is starting...
echo Address: http://127.0.0.1:3000
echo Keep this window open while viewing the site.
echo.

if not exist "%NODE_EXE%" (
  echo ERROR: Node.js was not found.
  echo Missing: %NODE_EXE%
  echo.
  pause
  exit /b 1
)

if not exist "%~dp0.next\BUILD_ID" (
  echo ERROR: Production build was not found.
  echo Please run build first, or use the dev mode launcher.
  echo.
  pause
  exit /b 1
)

if not exist "%~dp0node_modules\next\dist\bin\next" (
  echo ERROR: Next.js was not found in node_modules.
  echo Please make sure dependencies are installed.
  echo.
  pause
  exit /b 1
)

start "" "http://127.0.0.1:3000"
"%NODE_EXE%" "%~dp0node_modules\next\dist\bin\next" start -p 3000
set "EXIT_CODE=%ERRORLEVEL%"

echo.
echo The preview server stopped. Exit code: %EXIT_CODE%
echo.
pause
