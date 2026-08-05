@echo off
title Melodia
echo Starting Melodia...
echo.
echo The application will open in your browser shortly.
echo Press any key to stop the server when done.
echo.

cd /d "%~dp0"
node server.cjs

pause
