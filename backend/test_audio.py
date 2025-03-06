import asyncio
from ocr_service import convert_audio_to_wav, transcribe_audio_file, cleanup_files
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_audio_conversion(audio_file_path):
    """Test audio conversion and transcription with a known file."""
    try:
        # Read audio file
        with open(audio_file_path, 'rb') as f:
            audio_bytes = f.read()
        
        logger.info(f"Read audio file: {audio_file_path}, size: {len(audio_bytes)} bytes")
        
        # Convert to WAV
        wav_path, temp_dir = await convert_audio_to_wav(audio_bytes)
        logger.info(f"Converted to WAV: {wav_path}")
        
        # Transcribe
        text = transcribe_audio_file(wav_path)
        logger.info(f"Transcription result: {text}")
        
        # Clean up
        cleanup_files(None, wav_path, temp_dir)
        return text
        
    except Exception as e:
        logger.error(f"Error in test: {str(e)}")
        raise

if __name__ == "__main__":
    # Path to a test audio file
    test_file = "path/to/test/audio.webm"  # Replace with actual path
    
    if not os.path.exists(test_file):
        print(f"Test file not found: {test_file}")
        exit(1)
        
    result = asyncio.run(test_audio_conversion(test_file))
    print(f"Final result: {result}")