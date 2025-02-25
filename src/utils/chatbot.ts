const GOOGLE_AI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;

interface ChatbotResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const askChatbot = async (message: string): Promise<string> => {
  try {
    const response = await fetch(`${GOOGLE_AI_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from chatbot');
    }

    const data: ChatbotResponse = await response.json();
    return data.candidates[0]?.content.parts[0]?.text || 'No response available';
  } catch (error) {
    console.error('Chatbot error:', error);
    throw error;
  }
};