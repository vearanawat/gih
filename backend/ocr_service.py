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

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:8080"],
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
    name_patterns = [
        r'Dr\.\s[A-Z][a-z]+\s[A-Z][a-z]+',
        r'Patient:\s[A-Z][a-z]+\s[A-Z][a-z]+',
        r'Name:\s[A-Z][a-z]+\s[A-Z][a-z]+'
    ]
    
    doctor_name = ""
    patient_name = ""
    
    for line in text.split('\n'):
        if 'Dr.' in line:
            doctor_name = line.strip()
        elif 'Patient:' in line or 'Name:' in line:
            patient_name = line.split(':')[-1].strip()
            
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
                medicine = {
                    'name': match.group('name'),
                    'dosage': match.group('dosage') if 'dosage' in match.groupdict() else '',
                    'quantity': 0,
                    'confidence': 0.9
                }
                medicines.append(medicine)
    
    return medicines

@app.get("/")
async def root():
    return {"status": "healthy", "message": "OCR Service is running"}

@app.post("/process-prescription")
async def process_prescription(file: UploadFile = File(...)):
    try:
        # Initialize OCR if not already done
        ocr_instance = get_ocr()
        
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
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
            "structured_data": {
                "patient_name": patient_name,
                "doctor_name": doctor_name,
                "date": date,
                "medicines": medicines,
                "confidence": avg_confidence,
                "raw_text": full_text
            },
            "annotated_image": annotated_image_bytes
        }




        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")



##################### Multilingual OCR #####################

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import easyocr
import cv2
import numpy as np
from PIL import Image
import io
import re
import os
import time
from typing import List, Tuple

# Add this to your imports section along with your existing imports

# Initialize EasyOCR readers for different language pairs
easyocr_readers = {}

def get_easyocr_reader(lang_pair):
    """Get or initialize an EasyOCR reader for a specific language pair."""
    key = "-".join(lang_pair)
    if key not in easyocr_readers:
        try:
            easyocr_readers[key] = easyocr.Reader(
                lang_pair,
                gpu=True if cv2.cuda.getCudaEnabledDeviceCount() > 0 else False,
                download_enabled=True
            )
        except Exception as e:
            print(f"Error initializing EasyOCR for {lang_pair}: {str(e)}")
            return None
    return easyocr_readers[key]

def calculate_iou(box1, box2):
    """Calculate Intersection over Union (IoU) between two boxes."""
    # Extract coordinates
    x1_1, y1_1, x2_1, y2_1 = box1
    x1_2, y1_2, x2_2, y2_2 = box2
    
    # Calculate intersection area
    x_left = max(x1_1, x1_2)
    y_top = max(y1_1, y1_2)
    x_right = min(x2_1, x2_2)
    y_bottom = min(y2_1, y2_2)
    
    if x_right < x_left or y_bottom < y_top:
        return 0.0
    
    intersection_area = (x_right - x_left) * (y_bottom - y_top)
    
    # Calculate union area
    box1_area = (x2_1 - x1_1) * (y2_1 - y1_1)
    box2_area = (x2_2 - x1_2) * (y2_2 - y1_2)
    union_area = box1_area + box2_area - intersection_area
    
    return intersection_area / union_area if union_area > 0 else 0.0

def remove_duplicates(results, iou_threshold=0.5):
    """
    Remove duplicate detections based on IoU (Intersection over Union)
    of bounding boxes and confidence scores.
    """
    if not results:
        return []
    
    # Sort by confidence (highest first)
    sorted_results = sorted(results, key=lambda x: x[2], reverse=True)
    
    final_results = []
    used_boxes = []
    
    for result in sorted_results:
        bbox, text, prob = result
        
        # Convert to [x1, y1, x2, y2] format
        box = [
            min(p[0] for p in bbox), min(p[1] for p in bbox),  # top left
            max(p[0] for p in bbox), max(p[1] for p in bbox)   # bottom right
        ]
        
        # Check if this box overlaps significantly with any used box
        is_duplicate = False
        for used_box in used_boxes:
            if calculate_iou(box, used_box) > iou_threshold:
                is_duplicate = True
                break
        
        # If not a duplicate, add to final results
        if not is_duplicate:
            final_results.append(result)
            used_boxes.append(box)
    
    return final_results

def extract_text_and_confidence_easyocr(results):
    """Extract text and confidence scores from EasyOCR result."""
    extracted_data = []
    combined_text = ""
    
    for bbox, text, prob in results:
        # Add to combined text for summarization
        combined_text += text + " "
        
        extracted_data.append({
            "text": text,
            "confidence": float(prob),
            "box": bbox
        })
    
    # Get summary using Groq if text is available
    summary = ""
    if combined_text.strip():
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[{
                    "role": "user",
                    "content": f"Summarize this multilingual text concisely: {combined_text}"
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

def create_annotated_image(image, results):
    """Create annotated image from EasyOCR results."""
    # Convert PIL Image to OpenCV format
    img_cv = np.array(image)
    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_RGB2BGR)
    
    # Draw bounding boxes and text
    for (bbox, text, prob) in results:
        # Convert points to integers
        points = np.array(bbox).astype(np.int32)
        
        # Draw polygon
        cv2.polylines(img_cv, [points], isClosed=True, color=(0, 255, 0), thickness=2)
        
        # Add text near the bounding box
        top_left = tuple(map(int, bbox[0]))
        cv2.putText(img_cv, 
                   text, 
                   (top_left[0], top_left[1] - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
    
    # Convert back to PIL Image
    img_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
    annotated_image = Image.fromarray(img_cv)
    
    return annotated_image

# Add this new route to your FastAPI app
@app.post("/process-multilingual")
async def process_multilingual(file: UploadFile = File(...)):
    try:
        # Define language pairs (each with English)
        language_pairs = [
            ['en', 'hi'],  # English + Hindi
            ['en', 'bn'],  # English + Bengali
            ['en', 'ta'],  # English + Tamil
            ['en', 'te'],  # English + Telugu
            ['en', 'kn'],  # English + Kannada
        ]
        
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert PIL Image to numpy array
        img_array = np.array(image)
        
        all_results = []
        processing_times = {}
        
        # Process with each language pair
        for lang_pair in language_pairs:
            try:
                start_time = time.time()
                reader = get_easyocr_reader(lang_pair)
                if not reader:
                    continue
                
                # Perform OCR
                results = reader.readtext(img_array)
                processing_time = time.time() - start_time
                processing_times["-".join(lang_pair)] = processing_time
                
                all_results.extend(results)
                
            except Exception as e:
                print(f"Error processing {lang_pair}: {str(e)}")
        
        if not all_results:
            return {
                "results": [],
                "message": "No text detected in image"
            }
        
        # Remove duplicates based on bounding box overlap
        final_results = remove_duplicates(all_results)
        
        # Extract text and confidence scores
        extracted_data = extract_text_and_confidence_easyocr(final_results)
        
        # Generate annotated image
        try:
            annotated_image = create_annotated_image(image, final_results)
            
            # Save annotated image to bytes
            img_byte_arr = io.BytesIO()
            annotated_image.save(img_byte_arr, format='PNG')
            annotated_image_bytes = img_byte_arr.getvalue()
            
        except Exception as e:
            print(f"Error generating annotated image: {str(e)}")
            annotated_image_bytes = None
        
        # Calculate average confidence
        confidences = [item["confidence"] for item in extracted_data["extracted_data"]]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # Extract text by language (basic approach)
        language_texts = {}
        for lang_pair in language_pairs:
            lang_code = lang_pair[1]  # Non-English language code
            language_texts[lang_code] = []
        
        # Just collecting all texts (a smarter approach would use language detection)
        full_text = extracted_data["full_text"]
        
        return {
            "results": extracted_data["extracted_data"],
            "structured_data": {
                "raw_text": full_text,
                "confidence": avg_confidence,
                "processing_times": processing_times,
                "languages_detected": list(language_pairs)
            },
            "annotated_image": annotated_image_bytes
        }
        
    except Exception as e:
        print(f"Error processing multilingual image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing multilingual image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 