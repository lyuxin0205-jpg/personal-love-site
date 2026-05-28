@echo off
setlocal
title Couple Site Dev Mode - auto refresh
cd /d "%~dp0"

set "NODE_EXE=C:\Users\13770\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

echo.
echo Dev mode is starting...
echo Address: http://127.0.0.1:3000
echo Edit data\site.ts and the page should refresh automatically.
echo Keep this window open while editing.
echo.

if not exist "%NODE_EXE%" (
  echo ERROR: Node.js was not found.
  echo Missing: %NODE_EXE%
  echo.
  pause
  exit /b 1
)

if not exist "%~dp0node_modules\next\dist\bin\next" (
  echo ERROR: Next.js dependencies were not found.
  echo Please make sure node_modules exists.
  echo.
  pause
  exit /b 1
)

start "" "http://127.0.0.1:3000"
"%NODE_EXE%" "%~dp0node_modules\next\dist\bin\next" dev -p 3000

echo.
echo Dev server stopped.
echo.
pause
