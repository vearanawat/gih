# MediFlow Backend

This directory contains the backend services for the MediFlow application, including:
- Medical image analysis
- OCR for prescription processing
- API endpoints for the frontend

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- macOS/Linux:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your API keys:
```
GROQ_API_KEY=your_groq_api_key
```

## Running the Server

### Option 1: Using the startup scripts
- Windows: Double-click `start_server.bat` or run it from the command line
```bash
start_server.bat
```

- macOS/Linux: Make the script executable and run it
```bash
chmod +x start_server.sh
./start_server.sh
```

### Option 2: Manual start
```bash
python main.py
```

The server will run at http://localhost:8000 by default.

## API Endpoints

- `/process-prescription` - Process a prescription image using OCR
- `/analyze-image` - Analyze a medical image for diagnostics
- `/ocr-status` - Check if the OCR service is running

## Troubleshooting

If you encounter a 404 error in the frontend when uploading prescriptions or images, make sure:
1. The backend server is running
2. You're using the correct URL (http://localhost:8000)
3. CORS is properly configured

The frontend includes fallback mock data if the backend is not available, but for full functionality, the backend server should be running.

### Common Issues

1. **Missing Dependencies**: If you get import errors, make sure all dependencies are installed:
```bash
pip install -r requirements.txt
```

2. **API Key Issues**: If you get authentication errors, check your `.env` file and make sure your API keys are valid.

3. **Port Already in Use**: If port 8000 is already in use, you can change the port in `main.py`. 