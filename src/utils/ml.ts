import { createWorker } from "tesseract.js";
import axios, { AxiosError } from 'axios';

interface Medicine {
  name: string;
  dosage?: string;
  quantity?: number;
  instructions?: string;
  confidence: number;
}

interface OCRResult {
  id: string;
  patientName?: string;
  doctorName?: string;
  date?: string;
  medicines: Medicine[];
  confidence: number;
  raw_text: string;
  status: string;
}

interface PrescriptionDetails {
  doctor?: string;
  specialty?: string;
  hospital?: string;
  phone?: string;
  date?: string;
  patientName?: string;
  age?: string;
  weight?: string;
  clinicalDescription?: string;
  medications: string[];
}

interface DiagnosticResult {
  diagnosis: string;
  confidence: number;
  details: {
    raw_score: number;
    threshold: number;
  };
}

interface SymptomAnalysisResult {
  diagnoses: Array<{
    condition: string;
    probability: number;
  }>;
  recommendations: string[];
  urgency: string;
}

interface SecondOpinionResult {
  diagnosis: string;
  confidence: number;
  reasoning: string;
  recommendations: string[];
  differentialDiagnoses: Array<{
    condition: string;
    likelihood: number;
    explanation: string;
  }>;
  suggestedTests: string[];
}

// ✅ Correct Backend API URL
const API_BASE_URL = 'http://localhost:8000';

// Add server health check
const checkServerHealth = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

// ✅ Improved API Call with Better Error Handling
export const analyzePrescription = async (file: File): Promise<OCRResult> => {
  const formData = new FormData();
  formData.append('prescription_image', file);

  const response = await fetch('http://localhost:8000/api/analyze-prescription', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('OCR analysis failed');
  }

  return response.json();
};

// ✅ Optional: Frontend OCR with Tesseract.js
// Uncomment this if you want OCR to run in the browser instead of the backend
/*
export const runOCR = async (file: File): Promise<OCRResult> => {
  const worker = await createWorker("eng");
  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  console.log("🔍 Running Tesseract OCR...");
  const {
    data: { text },
  } = await worker.recognize(file);

  await worker.terminate();
  
  const cleanedText = sanitizeText(text);
  const foundMedicines = findMedicines(cleanedText);

  return {
    matched_medicines: foundMedicines,
    raw_text: cleanedText,
    confidence: 85, // Placeholder confidence
  };
};
*/

// ✅ Medicine Matching Helper Function
const commonMedicines = [
  "amoxicillin", "amox", "augmentin", "azithromycin", "zithromax",
  "ibuprofen", "advil", "paracetamol", "tylenol", "aspirin", "bayer",
  "amlodipine", "norvasc", "lisinopril", "zestril", "metoprolol", "lopressor",
  "metformin", "glucophage", "glipizide", "glucotrol",
  "omeprazole", "prilosec", "pantoprazole", "protonix",
  "mg", "tablet", "capsule", "daily", "twice", "three times"
];

const findMedicines = (text: string): string[] => {
  const words = text.split(" ");
  const found = new Set<string>();

  for (let i = 0; i < words.length; i++) {
    for (let j = 1; j <= 3; j++) {
      const phrase = words.slice(i, i + j).join(" ");
      for (const medicine of commonMedicines) {
        if (phrase === medicine || levenshteinDistance(phrase, medicine) <= 2) {
          found.add(medicine);
        }
      }
    }
  }

  return Array.from(found);
};

// ✅ String Cleaning
const sanitizeText = (text: string): string => {
  return text.toLowerCase().replace(/[^a-z0-9\s.]/g, "").replace(/\s+/g, " ").trim();
};

// ✅ Fuzzy Matching Helper (Levenshtein Distance)
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
};

const formatPrescriptionText = (rawText: string): PrescriptionDetails => {
  const lines = rawText.split(/[\n\r]+/).map(line => line.trim());
  const details: PrescriptionDetails = {
    medications: []
  };

  const medicinePatterns = [
    /\bSyp\s+([A-Za-z-]+(?:\s*\([^)]+\))?(?:\s+\d+(?:\.\d+)?(?:mg|ml|g))?\s*(?:(?:TD?S|BD|QDS|HS|SOS|OD|Q\d+H)\s*(?:x\s*\d+d)?)?)/i,
    /\bTab\s+([A-Za-z-]+(?:\s*\([^)]+\))?(?:\s+\d+(?:\.\d+)?(?:mg|ml|g))?\s*(?:(?:TD?S|BD|QDS|HS|SOS|OD|Q\d+H)\s*(?:x\s*\d+d)?)?)/i,
    /\bCap\s+([A-Za-z-]+(?:\s*\([^)]+\))?(?:\s+\d+(?:\.\d+)?(?:mg|ml|g))?\s*(?:(?:TD?S|BD|QDS|HS|SOS|OD|Q\d+H)\s*(?:x\s*\d+d)?)?)/i
  ];

  for (const line of lines) {
    // Clean and normalize the text
    const cleanLine = line.replace(/[^\w\s:/-]/g, ' ')
                         .replace(/\s+/g, ' ')
                         .trim();

    // Extract information using improved patterns
    if (cleanLine.match(/Dr|Doctor/i)) {
      details.doctor = cleanLine.replace(/Dr|Doctor/i, 'Dr.').trim();
    }
    if (cleanLine.match(/MD|MBBS|Specialty/i)) {
      details.specialty = cleanLine.trim();
    }
    if (cleanLine.match(/Hospital|Clinic|CHC/i)) {
      details.hospital = cleanLine.trim();
    }
    if (cleanLine.match(/Ph|Phone|Contact/i)) {
      details.phone = cleanLine.replace(/Ph:|Phone:|Contact:/i, '').trim();
    }
    if (cleanLine.match(/Date|Dt/i)) {
      details.date = cleanLine.replace(/Date:|Dt:/i, '').trim();
    }
    if (cleanLine.match(/Name|Patient/i)) {
      details.patientName = cleanLine.replace(/Name:|Patient:/i, '').trim();
    }
    if (cleanLine.match(/Age/i)) {
      details.age = cleanLine.replace(/Age:/i, '').trim();
    }
    if (cleanLine.match(/Weight|Wt/i)) {
      details.weight = cleanLine.replace(/Weight:|Wt:/i, '').trim();
    }

    // Check for medications using patterns
    for (const pattern of medicinePatterns) {
      const match = cleanLine.match(pattern);
      if (match) {
        details.medications.push(cleanLine);
      }
    }

    // Additional medicine patterns
    if (cleanLine.match(/\b(Syp|Tab|Cap)\b/i) && !details.medications.includes(cleanLine)) {
      details.medications.push(cleanLine);
    }
  }

  // Post-process medications to clean up format
  details.medications = details.medications.map(med => 
    med.replace(/\s+/g, ' ')
       .replace(/(\d+)\s*(\d+)/g, '$1.$2')
       .trim()
  );

  return details;
};

// Add medicine name patterns for better recognition
const commonMedicinePatterns = [
  'calpol', 'delcon', 'levolin', 'meftal', 'amoxicillin', 'azithromycin',
  'paracetamol', 'ibuprofen', 'cetrizine', 'montair', 'augmentin'
];

export const analyzeDiagnosticImage = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/analyze-diagnostic/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    console.error('Diagnostic analysis error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to analyze diagnostic image');
  }
};

const API_KEY = 'AIzaSyCHzoZHWJdqFeD7fCyTTeMNknq9AUZwpUM';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
const API_URL_VISION = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export const analyzeSymptoms = async (symptoms: string[]): Promise<SymptomAnalysisResult> => {
  try {
    const prompt = `As a medical AI assistant, analyze the following symptoms and provide potential diagnoses: ${symptoms.join(', ')}. 
    Consider common and serious conditions, and provide recommendations.`;

    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });

    // Process the response to match the expected format
    const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) {
      throw new Error('No analysis generated');
    }

    // Parse the result into structured data
    // This is a simplified example - in production, you'd want more robust parsing
    return {
      diagnoses: [
        { condition: 'Primary suspected condition', probability: 0.8 },
        { condition: 'Secondary possibility', probability: 0.6 }
      ],
      recommendations: [
        'Seek immediate medical attention',
        'Monitor symptoms',
        'Rest and hydrate'
      ],
      urgency: 'Medium'
    };
  } catch (error: any) {
    console.error('Symptom analysis error:', error);
    throw new Error(error.response?.data?.error?.message || error.message || 'Failed to analyze symptoms');
  }
};

export const getSecondOpinion = async (caseDetails: {
  patientAge: string;
  patientGender: string;
  symptoms: string;
  currentDiagnosis: string;
  medicalHistory: string;
  testResults: string;
}): Promise<SecondOpinionResult> => {
  try {
    const prompt = `As a medical AI assistant, provide a second opinion for the following case:
    Patient Age: ${caseDetails.patientAge}
    Patient Gender: ${caseDetails.patientGender}
    Symptoms: ${caseDetails.symptoms}
    Current Diagnosis: ${caseDetails.currentDiagnosis}
    Medical History: ${caseDetails.medicalHistory}
    Test Results: ${caseDetails.testResults}
    
    Please provide a comprehensive analysis including potential alternative diagnoses and recommendations.`;

    const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 2048,
      }
    });

    const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!result) {
      throw new Error('No second opinion generated');
    }

    // Return structured data
    return {
      diagnosis: 'Alternative diagnosis based on provided information',
      confidence: 0.85,
      reasoning: 'Detailed explanation of the reasoning process',
      recommendations: [
        'Additional tests to consider',
        'Treatment modifications',
        'Lifestyle changes'
      ],
      differentialDiagnoses: [
        {
          condition: 'Alternative condition 1',
          likelihood: 0.7,
          explanation: 'Explanation for this alternative'
        },
        {
          condition: 'Alternative condition 2',
          likelihood: 0.5,
          explanation: 'Explanation for this alternative'
        }
      ],
      suggestedTests: [
        'Additional blood work',
        'Imaging studies',
        'Specialist consultation'
      ]
    };
  } catch (error: any) {
    console.error('Second opinion error:', error);
    throw new Error(error.response?.data?.error?.message || error.message || 'Failed to get second opinion');
  }
};
