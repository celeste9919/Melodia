@echo off
title AI Music Studio
echo Starting AI Music Studio...
echo.
echo The application will open in your browser shortly.
echo Press any key to stop the server when done.
echo.

cd /d "%~dp0"
node server.cjs

pause
