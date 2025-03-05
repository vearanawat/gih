@echo off
echo Starting MediFlow Backend Server...
echo.
echo Make sure you have activated your virtual environment and installed all dependencies.
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    echo Virtual environment activated.
) else (
    echo Warning: Virtual environment not found. Make sure dependencies are installed.
)

echo.
echo Starting server at http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python main.py 