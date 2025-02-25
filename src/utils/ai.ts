import axios from 'axios';

const API_KEY = 'AIzaSyCHzoZHWJdqFeD7fCyTTeMNknq9AUZwpUM';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
const API_URL_VISION = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface AIResponse {
  candidates?: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
  error?: {
    message: string;
  };
}

const convertImageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateAIResponse = async (prompt: string, image?: File): Promise<string> => {
  try {
    let requestBody;
    let url;

    if (image) {
      // Handle image + text prompt
      const base64Image = await convertImageToBase64(image);
      url = `${API_URL_VISION}?key=${API_KEY}`;
      requestBody = {
        contents: [{
          parts: [
            {
              text: `You are a medical AI assistant. Analyze this medical image and respond to the following in a helpful and professional manner. Focus on identifying medical conditions, prescriptions, or relevant medical information visible in the image: ${prompt}`
            },
            {
              inline_data: {
                mime_type: image.type,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,  // Reduced for more accurate medical analysis
          topK: 32,
          topP: 0.8,
          maxOutputTokens: 2048,  // Increased for more detailed analysis
        }
      };
    } else {
      // Handle text-only prompt
      url = `${API_URL}?key=${API_KEY}`;
      requestBody = {
        contents: [{
          parts: [{
            text: `You are a medical AI assistant. Respond to the following in a helpful and professional manner: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };
    }

    // Add safety settings
    requestBody.safetySettings = [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ];

    const response = await axios.post<AIResponse>(url, requestBody);

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('No response generated');
    }

    return generatedText;
  } catch (error: any) {
    console.error('AI API Error:', error);
    throw new Error(error.response?.data?.error?.message || error.message || 'Failed to generate response');
  }
}; 