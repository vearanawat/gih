#!/bin/bash
echo "Starting MediFlow Backend Server..."
echo
echo "Make sure you have activated your virtual environment and installed all dependencies."
echo

# Activate virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "Virtual environment activated."
else
    echo "Warning: Virtual environment not found. Make sure dependencies are installed."
fi

echo
echo "Starting server at http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo

python main.py 