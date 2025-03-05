from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR, draw_ocr
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import re
from datetime import datetime
import os
from groq import Groq
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
import easyocr
import logging
from typing import List, Dict, Any
import speech_recognition as sr
from pydub import AudioSegment
import tempfile

# Load environment variables from .env file
load_dotenv()

# Create a standalone FastAPI app for direct usage
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set environment variable to avoid library conflicts
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'

# Initialize Groq client with API key
groq_api_key = os.getenv('GROQ_API_KEY')
if not groq_api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

# Initialize Groq client
groq_client = Groq(api_key=groq_api_key)

# Initialize OCR
ocr = None

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_ocr():
    global ocr
    if ocr is None:
        ocr = PaddleOCR(
            use_angle_cls=True,
            lang='en',
            use_gpu=False,
            show_log=False
        )
    return ocr

def extract_score(value):
    """Extracts the first float number from a string or tuple."""
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        match = re.search(r"\d+(\.\d+)?", value)
        return float(match.group()) if match else 0.0
    if isinstance(value, tuple):
        return extract_score(value[0])
    return 0.0

def extract_text_and_confidence(result):
    """Extract text and confidence scores from OCR result."""
    extracted_data = []
    combined_text = ""
    
    for line in result:
        for item in line:
            text = item[1][0]
            confidence = float(item[1][1])
            box_data = item[0]
            
            # Add to combined text for summarization
            combined_text += text + " "
            
            extracted_data.append({
                "text": text,
                "confidence": confidence,
                "box": box_data
            })
    
    # Get summary using Groq if text is available
    summary = ""
    if combined_text.strip():
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[{
                    "role": "user",
                    "content": f"Summarize this medical prescription text concisely: {combined_text}"
                }],
                model="llama-3.3-70b-versatile",
            )
            summary = chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Error getting summary: {e}")
            summary = "Error generating summary"
    
    return {
        "extracted_data": extracted_data,
        "summary": summary,
        "full_text": combined_text.strip()
    }

def extract_date(text):
    """Extract date from text using various formats."""
    date_patterns = [
        r'\d{2}[-/]\d{2}[-/]\d{4}',
        r'\d{4}[-/]\d{2}[-/]\d{2}',
        r'\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group()
    return ""

def extract_names(text):
    """Extract potential patient and doctor names."""
    # Default values
    doctor_name = ""
    patient_name = ""
    
    # More specific patterns for doctor names
    doctor_patterns = [
        r'Dr\.\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # Dr. Lastname or Dr. Firstname Lastname
        r'Doctor:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # Doctor: Name
        r'Physician:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'  # Physician: Name
    ]
    
    # More specific patterns for patient names
    patient_patterns = [
        r'Patient:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # Patient: Name
        r'Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # Name: Name
        r'Patient Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'  # Patient Name: Name
    ]
    
    # Try to extract doctor name using patterns
    for pattern in doctor_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            doctor_name = match.group(1).strip()
            break
    
    # Try to extract patient name using patterns
    for pattern in patient_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            patient_name = match.group(1).strip()
            break
    
    # If no patterns matched, try line-by-line approach as fallback
    if not doctor_name or not patient_name:
        for line in text.split('\n'):
            line = line.strip()
            if not doctor_name and ('Dr.' in line or 'Doctor:' in line or 'Physician:' in line):
                # Extract name after Dr./Doctor:/Physician:
                parts = re.split(r'Dr\.|Doctor:|Physician:', line, 1)
                if len(parts) > 1:
                    doctor_name = parts[1].strip()
            
            if not patient_name and ('Patient:' in line or 'Name:' in line or 'Patient Name:' in line):
                # Extract name after Patient:/Name:/Patient Name:
                parts = re.split(r'Patient:|Name:|Patient Name:', line, 1)
                if len(parts) > 1:
                    patient_name = parts[1].strip()
    
    # If we still don't have names, try to extract any capitalized words that might be names
    if not doctor_name and not patient_name:
        # Look for capitalized words that might be names
        name_candidates = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b', text)
        if len(name_candidates) >= 2:
            # Assume first is patient, second is doctor (or vice versa)
            patient_name = name_candidates[0]
            doctor_name = name_candidates[1]
            
    return patient_name, doctor_name

def extract_medicines(text):
    """Extract medicine information from text."""
    medicines = []
    medicine_patterns = [
        r'(?P<name>\b[A-Za-z]+)\s+(?P<dosage>\d+\s*(?:mg|ml|g))',
        r'Tab\.\s*(?P<name>[A-Za-z]+)\s*(?P<dosage>\d+\s*(?:mg|ml|g))?',
        r'Cap\.\s*(?P<name>[A-Za-z]+)\s*(?P<dosage>\d+\s*(?:mg|ml|g))?'
    ]
    
    lines = text.split('\n')
    for line in lines:
        for pattern in medicine_patterns:
            matches = re.finditer(pattern, line, re.IGNORECASE)
            for match in matches:
                try:
                    medicine = {
                        'name': match.group('name'),
                        'dosage': match.group('dosage') if 'dosage' in match.groupdict() else '',
                        'quantity': 0,
                        'confidence': 0.9
                    }
                    medicines.append(medicine)
                except IndexError:
                    # Skip if group not found
                    continue
    
    return medicines

def convert_audio_to_wav(audio_bytes):
    """Convert audio bytes to WAV format using pydub."""
    temp_dir = None
    temp_input_path = None
    temp_output_path = None
    
    try:
        # Create a temporary directory for our files
        temp_dir = tempfile.mkdtemp()
        temp_input_path = os.path.join(temp_dir, 'input.webm')  # Explicitly use .webm extension
        temp_output_path = os.path.join(temp_dir, 'output.wav')
        
        # Write the audio bytes to a temporary file
        with open(temp_input_path, 'wb') as f:
            f.write(audio_bytes)
        
        try:
            # Try to load as WebM first
            try:
                logger.info("Attempting to convert WebM audio...")
                audio = AudioSegment.from_file(temp_input_path, format='webm')
                logger.info("Successfully loaded WebM audio")
            except Exception as webm_error:
                logger.error(f"WebM conversion failed: {str(webm_error)}")
                # Try as WAV
                try:
                    logger.info("Attempting to convert as WAV...")
                    audio = AudioSegment.from_wav(temp_input_path)
                    logger.info("Successfully loaded WAV audio")
                except Exception as wav_error:
                    logger.error(f"WAV conversion failed: {str(wav_error)}")
                    # Try as generic format
                    try:
                        logger.info("Attempting to convert as generic format...")
                        audio = AudioSegment.from_file(temp_input_path)
                        logger.info("Successfully loaded audio in generic format")
                    except Exception as generic_error:
                        logger.error(f"Generic format conversion failed: {str(generic_error)}")
                        raise HTTPException(
                            status_code=400,
                            detail="Could not convert audio file. Please try recording again."
                        )

            # Process the audio
            logger.info("Processing audio...")
            audio = audio.set_channels(1)  # Convert to mono
            audio = audio.set_frame_rate(16000)  # Set sample rate to 16kHz
            
            # Export as WAV
            logger.info("Exporting to WAV format...")
            audio.export(temp_output_path, format='wav')
            logger.info("Successfully exported to WAV")
            
            # Verify the output file
            if not os.path.exists(temp_output_path):
                raise HTTPException(
                    status_code=500,
                    detail="Failed to create output file"
                )
            
            if os.path.getsize(temp_output_path) == 0:
                raise HTTPException(
                    status_code=500,
                    detail="Output file is empty"
                )
            
            logger.info("Audio conversion completed successfully")
            return temp_output_path, temp_dir
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error during audio conversion: {str(e)}")
            cleanup_files(temp_input_path, temp_output_path, temp_dir)
            raise HTTPException(
                status_code=400,
                detail="Failed to process audio file. Please try recording again."
            )
            
    except Exception as e:
        logger.error(f"Error in audio handling: {str(e)}")
        cleanup_files(temp_input_path, temp_output_path, temp_dir)
        raise HTTPException(
            status_code=500,
            detail="Failed to process audio file. Please try again."
        )

def cleanup_files(input_path: str = None, output_path: str = None, dir_path: str = None):
    """Helper function to clean up temporary files."""
    try:
        # Close any open file handles
        import gc
        gc.collect()
        
        # Remove input file if it exists
        if input_path and os.path.exists(input_path):
            try:
                os.remove(input_path)
            except Exception as e:
                logger.warning(f"Failed to remove input file: {str(e)}")
        
        # Remove output file if it exists
        if output_path and os.path.exists(output_path):
            try:
                os.remove(output_path)
            except Exception as e:
                logger.warning(f"Failed to remove output file: {str(e)}")
        
        # Remove directory if it exists
        if dir_path and os.path.exists(dir_path):
            try:
                os.rmdir(dir_path)
            except Exception as e:
                logger.warning(f"Failed to remove temporary directory: {str(e)}")
                
    except Exception as e:
        logger.warning(f"Error during cleanup: {str(e)}")

def transcribe_audio_file(audio_file_path):
    """Transcribe audio file using speech recognition."""
    try:
        # Initialize recognizer
        recognizer = sr.Recognizer()
        
        # Load the audio file
        with sr.AudioFile(audio_file_path) as source:
            # Record the audio data
            audio_data = recognizer.record(source)
            
            try:
                # Try Google Speech Recognition
                text = recognizer.recognize_google(audio_data)
                logger.info("Successfully transcribed audio using Google Speech Recognition")
                return text
            except sr.RequestError as e:
                logger.error(f"Could not request results from Google Speech Recognition service: {e}")
                raise
            except sr.UnknownValueError:
                logger.error("Google Speech Recognition could not understand audio")
                raise HTTPException(
                    status_code=400,
                    detail="Could not understand audio. Please speak clearly and try again."
                )
            
    except Exception as e:
        logger.error(f"Error in transcribe_audio_file: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process audio file. Please try again."
        )

# Define a function to add OCR routes to a FastAPI app
# def add_ocr_routes(app: FastAPI):
#     @app.get("/ocr-status")
#     async def ocr_status():
#         return {"status": "healthy", "message": "OCR Service is running"}

#     @app.post("/transcribe-audio")
#     async def transcribe_audio(audio_file: UploadFile = File(...)):
#         """
#         Endpoint to transcribe audio file and extract information.
#         """
#         if not audio_file:
#             raise HTTPException(
#                 status_code=400,
#                 detail="No audio file provided"
#             )
            
#         if not audio_file.filename:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Invalid audio file"
#             )
            
#         # Check file size (limit to 10MB)
#         file_size = 0
#         content = await audio_file.read()
#         file_size = len(content)
#         if file_size > 10 * 1024 * 1024:  # 10MB
#             raise HTTPException(
#                 status_code=400,
#                 detail="Audio file too large. Maximum size is 10MB."
#             )
            
#         wav_path = None
#         temp_dir = None
        
#         try:
#             # Convert audio to WAV format
#             wav_path, temp_dir = convert_audio_to_wav(content)
            
#             # Initialize recognizer
#             recognizer = sr.Recognizer()
            
#             # Read the audio file
#             with sr.AudioFile(wav_path) as source:
#                 # Adjust for ambient noise and set energy threshold
#                 recognizer.adjust_for_ambient_noise(source, duration=0.5)
#                 recognizer.energy_threshold = 300  # Adjust this value based on your needs
                
#                 # Record the audio data
#                 audio_data = recognizer.record(source)
                
#                 try:
#                     # Attempt to transcribe using Google Speech Recognition
#                     text = recognizer.recognize_google(audio_data)
                    
#                     if not text:
#                         raise HTTPException(
#                             status_code=400,
#                             detail="No speech detected in the audio"
#                         )
                    
#                     # Extract information from transcribed text
#                     patient_name, doctor_name = extract_names(text)
#                     date = extract_date(text)
#                     medicines = extract_medicines(text)
                    
#                     return JSONResponse(content={
#                         "success": True,
#                         "transcribed_text": text,
#                         "structured_data": {
#                             "patient_name": patient_name or "Not found",
#                             "doctor_name": doctor_name or "Not found",
#                             "date": date or "Not found",
#                             "medicines": medicines or []
#                         }
#                     })
                    
#                 except sr.RequestError as e:
#                     # Try using offline recognition as fallback
#                     try:
#                         text = recognizer.recognize_sphinx(audio_data)
#                         if text:
#                             return JSONResponse(content={
#                                 "success": True,
#                                 "transcribed_text": text,
#                                 "note": "Used offline recognition (lower accuracy)",
#                                 "structured_data": {
#                                     "patient_name": "Not found",
#                                     "doctor_name": "Not found",
#                                     "date": "Not found",
#                                     "medicines": []
#                                 }
#                             })
#                     except:
#                         raise HTTPException(
#                             status_code=503,
#                             detail="Speech recognition services unavailable. Please try again later."
#                         )
#                 except sr.UnknownValueError:
#                     raise HTTPException(
#                         status_code=400,
#                         detail="Could not understand the audio. Please speak clearly and try again."
#                     )
#                 except Exception as e:
#                     logger.error(f"Error during transcription: {str(e)}")
#                     raise HTTPException(
#                         status_code=500,
#                         detail="Error processing audio. Please try again."
#                     )
                
#         except HTTPException:
#             raise
#         except Exception as e:
#             logger.error(f"Unexpected error: {str(e)}")
#             raise HTTPException(
#                 status_code=500,
#                 detail="An unexpected error occurred. Please try again."
#             )
#         finally:
#             # Clean up temporary files
#             cleanup_files(None, wav_path, temp_dir)
    
# @app.post("/process-prescription")
# async def process_prescription(file: UploadFile = File(...)):
#     try:
#         # Initialize OCR if not already done
#         ocr_instance = get_ocr()
        
#         # Read image file
#         contents = await file.read()
#         image = Image.open(io.BytesIO(contents))
        
#         # Convert PIL Image to numpy array
#         img_array = np.array(image)
        
#         # Perform OCR
#         result = ocr_instance.ocr(img_array, cls=True)
        
#         if not result or len(result) == 0:
#             return {
#                 "results": [],
#                 "message": "No text detected in image"
#             }
        
#         # Extract text and confidence scores
#         extracted_data = extract_text_and_confidence(result)
        
#         # Combine all text for processing
#         full_text = extracted_data["full_text"]
        
#         # Extract structured information
#         patient_name, doctor_name = extract_names(full_text)
#         date = extract_date(full_text)
#         medicines = extract_medicines(full_text)
        
#         # Calculate average confidence
#         confidences = [item["confidence"] for item in extracted_data["extracted_data"]]
#         avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
#         # Generate annotated image
#         boxes = [item["box"] for item in extracted_data["extracted_data"]]
#         texts = [item["text"] for item in extracted_data["extracted_data"]]
#         scores = [item["confidence"] for item in extracted_data["extracted_data"]]
        
#         try:
#             font = ImageFont.load_default()
#             annotated_image = draw_ocr(image, boxes, texts, scores)
#             annotated_image = Image.fromarray(annotated_image)
            
#             # Save annotated image to bytes
#             img_byte_arr = io.BytesIO()
#             annotated_image.save(img_byte_arr, format='PNG')
#             annotated_image_bytes = img_byte_arr.getvalue()
            
#         except Exception as e:
#             print(f"Error generating annotated image: {str(e)}")
#             annotated_image_bytes = None
        
#         return {
#             "results": extracted_data["extracted_data"],
#             "summary": extracted_data["summary"],
#             "structured_data": {
#                 "patient_name": patient_name,
#                 "doctor_name": doctor_name,
#                 "date": date,
#                 "medicines": medicines,
#                 "confidence": avg_confidence,
#                 "raw_text": full_text
#             }
#         }
#     except Exception as e:
#         print(f"Error processing image: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")





# In ocr_service.py

def add_ocr_routes(app: FastAPI):
    @app.get("/ocr-status")
    async def ocr_status():
        return {"status": "healthy", "message": "OCR Service is running"}

    @app.post("/transcribe-audio")
    async def transcribe_audio(audio_file: UploadFile = File(...)):
        """
        Endpoint to transcribe audio file and extract information.
        """
        # Existing implementation...
    
    @app.post("/process-prescription")
    async def process_prescription(file: UploadFile = File(...)):
        try:
            # Initialize OCR if not already done
            ocr_instance = get_ocr()
            print(f"Received file: {file.filename}, content type: {file.content_type}")
            
            # Read image file
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            print(f"Image size: {image}")
            if image.mode == 'RGBA':
            # Create a white background image
                background = Image.new('RGB', image.size, (255, 255, 255))
            # Paste the image on the background using alpha channel as mask
                background.paste(image, mask=image.split()[3])  # 3 is the alpha channel
                image = background
            
            elif image.mode != 'RGB':
            # Convert any other mode to RGB
                image = image.convert('RGB')
            
            # Convert PIL Image to numpy array
            img_array = np.array(image)
            
            # Perform OCR
            result = ocr_instance.ocr(img_array, cls=True)
            
            if not result or len(result) == 0:
                return {
                    "results": [],
                    "message": "No text detected in image"
                }
            
            # Extract text and confidence scores
            extracted_data = extract_text_and_confidence(result)
            
            # Combine all text for processing
            full_text = extracted_data["full_text"]
            
            # Extract structured information
            patient_name, doctor_name = extract_names(full_text)
            date = extract_date(full_text)
            medicines = extract_medicines(full_text)
            
            # Calculate average confidence
            confidences = [item["confidence"] for item in extracted_data["extracted_data"]]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            # Generate annotated image
            boxes = [item["box"] for item in extracted_data["extracted_data"]]
            texts = [item["text"] for item in extracted_data["extracted_data"]]
            scores = [item["confidence"] for item in extracted_data["extracted_data"]]
            
            try:
                font = ImageFont.load_default()
                annotated_image = draw_ocr(image, boxes, texts, scores)
                annotated_image = Image.fromarray(annotated_image)
                
                # Save annotated image to bytes
                img_byte_arr = io.BytesIO()
                annotated_image.save(img_byte_arr, format='PNG')
                annotated_image_bytes = img_byte_arr.getvalue()
                
            except Exception as e:
                print(f"Error generating annotated image: {str(e)}")
                annotated_image_bytes = None
            
            return {
                "results": extracted_data["extracted_data"],
                "summary": extracted_data["summary"],
                "structured_data": {
                    "patient_name": patient_name,
                    "doctor_name": doctor_name,
                    "date": date,
                    "medicines": medicines,
                    "confidence": avg_confidence,
                    "raw_text": full_text
                }
            }
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
# Add routes to the standalone app
add_ocr_routes(app)

# For running this file directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 