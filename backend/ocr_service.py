from fastapi import FastAPI, File, UploadFile, HTTPException
from paddleocr import PaddleOCR, draw_ocr
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import re
from datetime import datetime
import os
from groq import Groq
import logging
from typing import List, Dict, Any
import speech_recognition as sr
from pydub import AudioSegment
import tempfile
import shutil

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OCR
ocr = None

# Initialize Groq client (assuming it's configured elsewhere)
groq_client = None
try:
    from dotenv import load_dotenv
    load_dotenv()
    groq_api_key = os.getenv('GROQ_API_KEY')
    if groq_api_key:
        groq_client = Groq(api_key=groq_api_key)
except Exception as e:
    logger.error(f"Failed to initialize Groq client: {e}")

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

# Text extraction helper functions
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
    if combined_text.strip() and groq_client:
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
            logger.error(f"Error getting summary: {e}")
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

async def convert_audio_to_wav(audio_bytes):
    """Convert audio bytes to WAV format using pydub."""
    temp_dir = None
    temp_input_path = None
    temp_output_path = None
    
    try:
        # Create a temporary directory for our files
        temp_dir = tempfile.mkdtemp()
        temp_input_path = os.path.join(temp_dir, 'input.webm')
        temp_output_path = os.path.join(temp_dir, 'output.wav')
        
        # Write the audio bytes to a temporary file
        with open(temp_input_path, 'wb') as f:
            f.write(audio_bytes)
        
        # Define formats to try
        formats_to_try = ['webm', 'wav', None]  # None means try as generic format
        
        audio = None
        last_error = None
        
        # Try different formats until one works
        for format_name in formats_to_try:
            format_str = format_name if format_name else "generic format"
            try:
                logger.info(f"Attempting to convert audio as {format_str}...")
                
                if format_name == 'wav':
                    audio = AudioSegment.from_wav(temp_input_path)
                elif format_name:
                    audio = AudioSegment.from_file(temp_input_path, format=format_name)
                else:
                    audio = AudioSegment.from_file(temp_input_path)
                    
                logger.info(f"Successfully loaded audio as {format_str}")
                break  # Exit loop if successful
                
            except Exception as e:
                last_error = e
                logger.error(f"{format_str.capitalize()} conversion failed: {str(e)}")
        
        # If all attempts failed
        if audio is None:
            raise HTTPException(
                status_code=400,
                detail=f"Could not convert audio file: {str(last_error)}. Please try recording again."
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
        if not os.path.exists(temp_output_path) or os.path.getsize(temp_output_path) == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to create valid output file"
            )
        
        logger.info("Audio conversion completed successfully")
        return temp_output_path, temp_dir
            
    except HTTPException:
        # Cleanup before re-raising
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
        raise
        
    except Exception as e:
        logger.error(f"Error in audio handling: {str(e)}")
        if temp_dir and os.path.exists(temp_dir):
            shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process audio file: {str(e)}. Please try again."
        )

def cleanup_files(input_path=None, output_path=None, dir_path=None):
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

def add_ocr_routes(app: FastAPI):
    @app.get("/ocr-status")
    async def ocr_status():
        return {"status": "healthy", "message": "OCR Service is running"}

    @app.post("/transcribe-audio")
    async def transcribe_audio(audio_file: UploadFile = File(...)):
        """
        Endpoint to transcribe audio file and extract information.
        """
        try:
            # Create temporary directory for audio processing
            audio_bytes = await audio_file.read()
            temp_output_path, temp_dir = await convert_audio_to_wav(audio_bytes)
            
            try:
                # Transcribe the audio file
                transcribed_text = transcribe_audio_file(temp_output_path)
                
                # Extract information from transcribed text
                patient_name, doctor_name = extract_names(transcribed_text)
                date = extract_date(transcribed_text)
                medicines = extract_medicines(transcribed_text)
                
                # Return structured response
                return {
                    "success": True,
                    "transcribed_text": transcribed_text,
                    "structured_data": {
                        "patient_name": patient_name or "Not found",
                        "doctor_name": doctor_name or "Not found",
                        "date": date or "Not found",
                        "medicines": medicines or [],
                        "confidence": 0.95,
                        "raw_text": transcribed_text
                    }
                }
            finally:
                # Clean up temporary files
                cleanup_files(None, temp_output_path, temp_dir)
                
        except HTTPException as http_error:
            return {
                "success": False,
                "error": http_error.detail
            }
        except Exception as e:
            logger.error(f"Error in transcribe_audio: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to process audio file: {str(e)}. Please try again."
            }
    
    @app.post("/process-prescription")
    async def process_prescription(file: UploadFile = File(...)):
        try:
            # Initialize OCR if not already done
            ocr_instance = get_ocr()
            logger.info(f"Received file: {file.filename}, content type: {file.content_type}")
            
            # Read image file
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            
            # Handle image format
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
            logger.error(f"Error processing image: {str(e)}")
            return {
                "success": False,
                "error": f"Error processing image: {str(e)}"
            }