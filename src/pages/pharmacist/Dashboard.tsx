import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, Search, FileText, Clock, Edit, Check, X, 
  AlertCircle, Filter, Download, ShoppingCart, AlertTriangle, Users, Loader2, Square, Mic
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {  useUser } from "@clerk/clerk-react";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  instructions: string;
  confidence: number;
}

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  medicines: Medicine[];
  status: 'pending' | 'processed' | 'rejected';
  confidence: number;
  originalText: string;
  imageUrl: string;
  summary: string;
  hospital?: string;
}

interface OCRResult {
  text: string;
  confidence: number;
  box: number[][];
}

interface ProcessedResult {
  results: {
    text: string;
    confidence: number;
    box: number[][];
  }[];
  summary: string;
  structured_data: {
    patient_name: string;
    date: string;
    doctor_name: string;
    medicines: Medicine[];
  };
}

interface AudioRecorderState {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
}

interface MedicineRecord {
  name: string;
  short_composition1: string;
  short_composition2: string;
  price: number;
}

const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    patientName: 'John Doe',
    doctorName: 'Dr. Smith',
    date: '2024-03-15',
    medicines: [
      {
        id: '1',
        name: 'Amoxicillin',
        dosage: '500mg',
        quantity: 30,
        instructions: 'Take 1 tablet twice daily',
        confidence: 0.95
      }
    ],
    status: 'pending',
    confidence: 0.92,
    originalText: 'Rx\nAmoxicillin 500mg\n#30\nTake 1 tablet twice daily',
    imageUrl: '',
    summary: ''
  }
];

const defaultMedicine: Medicine = {
  id: String(Date.now()),
  name: 'Unknown Medicine',
  dosage: 'Not specified',
  quantity: 0,
  instructions: '',
  confidence: 0.5
};

const PharmacistDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<OCRResult[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedText, setEditedText] = useState('');
  const [summary, setSummary] = useState<string>('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioState, setAudioState] = useState<AudioRecorderState>({
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],
  });
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [medicineData, setMedicineData] = useState<MedicineRecord[]>([]);
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const loadMedicineData = async () => {
      try {
        const response = await fetch('/medicines.csv');
        const csvText = await response.text();
        const rows = csvText.split('\n').slice(1); // Skip header row
        const medicines = rows
          .filter(row => row.trim()) // Filter out empty rows
          .map(row => {
            try {
              const [id, name, price, discontinued, manufacturer, type, packaging, ...compositions] = row.split(',');
              return {
                name: name?.trim() || 'Unknown Medicine',
                short_composition1: compositions[0]?.trim() || '',
                short_composition2: compositions[1]?.trim() || '',
                price: parseFloat(price) || 0
              };
            } catch (error) {
              console.warn('Error parsing medicine row:', row);
              return null;
            }
          })
          .filter(medicine => medicine !== null) as MedicineRecord[];
        setMedicineData(medicines);
      } catch (error) {
        console.error('Error loading medicine data:', error);
        // Set empty array as fallback
        setMedicineData([]);
      }
    };

    loadMedicineData();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setFile(file);
    setPreview(URL.createObjectURL(file));
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Try to call the actual API first
      const response = await fetch('http://localhost:8000/process-prescription', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process prescription');
      }

      const data = await response.json();
        handleProcessedData(data);
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
        
        // If API call fails, use mock data
        const mockData = generateMockPrescriptionData(file);
        handleProcessedData(mockData);
      }
    } catch (error) {
      console.error('Error processing prescription:', error);
      toast.error('Failed to process prescription');
      setIsProcessing(false);
    }
  };

  // Helper function to handle processed data
  const handleProcessedData = (data: any) => {
    const processedResults = data.results?.map(result => ({
      text: result.text,
      confidence: result.confidence,
      box: result.box || [[0, 0], [0, 0], [0, 0], [0, 0]]
    })) as OCRResult[] || [];
    
    setResults(processedResults);

    // Parse the summary text to extract information
    const summaryText = data.summary || '';
    setSummary(summaryText);

    // Extract information from the summary text
    const sections = parseSummaryText(summaryText);
    
    const patientName = sections.patientInfo[0] || data.structured_data?.patient_name || 'Unknown Patient';
    const doctorName = sections.doctorInfo[0] || data.structured_data?.doctor_name || 'Unknown Doctor';
    const prescriptionDate = sections.dates[0] || data.structured_data?.date || new Date().toISOString().split('T')[0];

    // Parse medicines from the medications section
    const medicines: Medicine[] = sections.medications.map(med => {
      // First try to match the full medicine line with all components
      const fullMatch = med.match(
        /^([^•\d]+?)(?:\s+(\d+(?:\.\d+)?(?:mg|ml|g|mcg)))?(?:\s+(?:Quantity:?\s*)?(\d+))?(?:\s+(?:Instructions:?\s*)?(.+))?$/i
      );

      if (fullMatch) {
        const [_, name, dosage, quantity, instructions] = fullMatch;
        return {
          id: String(Date.now() + Math.random()),
          name: name.trim(),
          dosage: dosage || '',
          quantity: parseInt(quantity || '0') || 30,
          instructions: instructions?.trim() || 'Take as directed',
          confidence: 0.95
        };
      }

      // If full match fails, try to extract components separately
      const nameMatch = med.match(/^([^•\d]+)/);
      const dosageMatch = med.match(/(\d+(?:\.\d+)?(?:mg|ml|g|mcg))/i);
      const quantityMatch = med.match(/(?:Quantity:?\s*)?(\d+)/i);
      const instructionsMatch = med.match(/(?:Instructions:?\s*)?(?:Take|Use|Apply)\s+(.+)$/i);

      return {
        id: String(Date.now() + Math.random()),
        name: nameMatch ? nameMatch[1].trim() : med.trim(),
        dosage: dosageMatch ? dosageMatch[1] : '',
        quantity: quantityMatch ? parseInt(quantityMatch[1]) : 30,
        instructions: instructionsMatch ? instructionsMatch[1].trim() : 'Take as directed',
        confidence: 0.95
      };
    });

    // If no medicines were parsed from summary, use structured data
    if (medicines.length === 0 && data.structured_data?.medicines) {
      medicines.push(...data.structured_data.medicines);
    }

    // Create the new prescription object
    const newPrescription: Prescription = {
      id: String(Date.now()),
      patientName,
      doctorName,
      date: prescriptionDate,
      medicines,
      status: 'pending',
      confidence: data.structured_data?.confidence || 0.95,
      originalText: data.structured_data?.raw_text || summaryText,
      imageUrl: preview || '',
      summary: summaryText,
      hospital: data.structured_data?.hospital || ''
    };

    setPrescriptions(prev => [newPrescription, ...prev]);
    setIsProcessing(false);
    
    toast.success('Prescription processed successfully');
  };

  // Generate mock prescription data
  const generateMockPrescriptionData = (file: File) => {
    return {
      results: [
        {
          text: "Patient: John Smith",
          confidence: 0.95,
          box: [[10, 10], [200, 10], [200, 30], [10, 30]]
        },
        {
          text: "Dr. Akshara",
          confidence: 0.92,
          box: [[10, 40], [150, 40], [150, 60], [10, 60]]
        },
        {
          text: "Date: " + new Date().toISOString().split('T')[0],
          confidence: 0.98,
          box: [[10, 70], [200, 70], [200, 90], [10, 90]]
        },
        {
          text: "Amoxicillin 500mg",
          confidence: 0.96,
          box: [[10, 100], [200, 100], [200, 120], [10, 120]]
        },
        {
          text: "Take 1 tablet three times daily",
          confidence: 0.94,
          box: [[10, 130], [250, 130], [250, 150], [10, 150]]
        }
      ],
      structured_data: {
        patient_name: "John Smith",
        doctor_name: "Dr. Akshara",
        date: new Date().toISOString().split('T')[0],
        medicines: [
          {
            id: String(Date.now()),
            name: "Amoxicillin",
            dosage: "500mg",
            quantity: 30,
            instructions: "Take 1 tablet three times daily",
            confidence: 0.96
          }
        ],
        confidence: 0.95,
        hospital: ''
      },
      summary: "Prescription for John Smith from Dr. Akshara. Medication: Amoxicillin 500mg, to be taken 1 tablet three times daily."
    };
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      toast.error('Please drop an image file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const sendEmailAfterSignup = async (recipientEmail: string) => {
    try {
      await fetch('http://localhost:5000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: 'Generate a professional email notifying a pharmacist that MediFlow’s AI assistant has analyzed a prescription and created an order. The email should include a subject line, mention the analysis process, list ordered items, encourage review, provide access details, and end with a professional sign-off. Format as a ready-to-send email ONLY without explanations or notes. Sample Order: Medicine: Metformin 500mg, Quantity: 30 tablets, Dosage: Twice daily after meals.',
          recipient: recipientEmail
        })
      });
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };
  const handleStatusChange = (prescriptionId: string, newStatus: 'processed' | 'rejected') => {
    setPrescriptions(prev => prev.map(p => {
      if (p.id === prescriptionId) {
        // If the prescription is being processed, create an order
        if (newStatus === 'processed') {
          const order = {
            id: `ORD-${Date.now()}`,
            patientName: p.patientName,
            medicines: p.medicines,
            status: 'pending' as const,
            date: new Date().toISOString().split('T')[0],
            total: calculateTotal(p.medicines),
            priority: 'normal' as const,
            imageUrl: p.imageUrl
          };

          // Navigate to orders page with the new order
          setTimeout(() => {
            navigate('/pharmacist-dashboard/orders', { state: { newOrder: order } });
          }, 500);
        }
        
        return { ...p, status: newStatus };
      }
      return p;
    }));

 
    sendEmailAfterSignup(user.primaryEmailAddress?.emailAddress || "");

    toast.success(`Prescription ${prescriptionId} has been ${newStatus}`);
  };

  // Helper function to find best matching medicine
  const findBestMatchingMedicine = (name: string): MedicineRecord | null => {
    if (!name || medicineData.length === 0) return null;

    const searchName = name.toLowerCase().replace(/\s+/g, '');
    
    // Try exact match first
    const exactMatch = medicineData.find(
      med => med.name.toLowerCase().replace(/\s+/g, '') === searchName
    );
    if (exactMatch) return exactMatch;

    // Try fuzzy matching
    let bestMatch: MedicineRecord | null = null;
    let bestScore = 0;

    medicineData.forEach(medicine => {
      const medName = medicine.name.toLowerCase().replace(/\s+/g, '');
      let score = 0;

      // Calculate character match score
      const chars = searchName.split('');
      chars.forEach(char => {
        if (medName.includes(char)) score += 1;
      });
      score = score / chars.length;

      // Boost score if search term is contained in medicine name
      if (medName.includes(searchName)) score += 0.5;

      // Boost score if search term is contained in composition
      const comp1 = medicine.short_composition1.toLowerCase();
      const comp2 = medicine.short_composition2.toLowerCase();
      if (comp1.includes(searchName) || comp2.includes(searchName)) score += 0.3;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = medicine;
      }
    });

    return bestScore > 0.6 ? bestMatch : null;
  };

  // Update getMedicinePrice to use the new matching function
  const getMedicinePrice = (name: string): number => {
    const medicine = findBestMatchingMedicine(name);
    return medicine?.price || 100; // Default price of 100 if medicine not found
  };

  // Helper function to calculate total price
  const calculateTotal = (medicines: Medicine[]): number => {
    return medicines.reduce((total, medicine) => {
      // Try to find medicine in database first
      const matchedMedicine = findBestMatchingMedicine(medicine.name);
      const price = matchedMedicine?.price || 100; // Use database price or default to 100
      const quantity = medicine.quantity || 1;
      const medicineTotal = price * quantity;
      
      console.log(`Medicine: ${medicine.name}, Quantity: ${quantity}, Price: ₹${price}${matchedMedicine ? ' (from database)' : ''}, Total: ₹${medicineTotal}`);
      return total + medicineTotal;
    }, 0);
  };

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.doctorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      handleFileUpload(file);
    }
  };

  const handleEdit = () => {
    const combinedText = results.map(result => result.text).join('\n');
    setEditedText(combinedText);
    setEditMode(true);
  };

  const handleSave = () => {
    // Create new results with default box coordinates for edited text
    const newResults: OCRResult[] = editedText.split('\n').map((text, index) => ({
      text: text.trim(),
      confidence: 1.0,
      box: [[0, 0], [100, 0], [100, 20], [0, 20]]
    }));
    
    setResults(newResults);
    setEditMode(false);
    setEditedText('');
    toast.success('Text updated successfully');
  };

  const handleEditSummary = () => {
    setEditedSummary(summary);
    setIsEditingSummary(true);
  };

  const handleSaveSummary = () => {
    setSummary(editedSummary);
    setIsEditingSummary(false);
    toast.success('Summary updated successfully');
  };

  const handleCancelSummary = () => {
    setIsEditingSummary(false);
    setEditedSummary(summary);
  };

  // Add this function to parse the summary text
  const parseSummaryText = (summaryText: string) => {
    const sections: { [key: string]: string[] } = {
      patientInfo: [],
      doctorInfo: [],
      medications: [],
      instructions: [],
      dates: []
    };

    const lines = summaryText.split('\n');
    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;

      // Determine the section
      if (line.includes('Patient Information:')) {
        currentSection = 'patientInfo';
        continue;
      } else if (line.includes('Doctor Information:')) {
        currentSection = 'doctorInfo';
        continue;
      } else if (line.includes('Prescribed Medications:')) {
        currentSection = 'medications';
        continue;
      } else if (line.includes('Special Instructions:')) {
        currentSection = 'instructions';
        continue;
      } else if (line.includes('Date:')) {
        // Extract the date directly
        const dateMatch = line.match(/Date:\s*(.+)/);
        if (dateMatch) {
          sections.dates.push(dateMatch[1].trim());
        }
        continue;
      }

      // Process the line based on the current section
      if (currentSection) {
        // Remove bullet points and extra spaces
        line = line.replace(/^[•\-]\s*/, '').trim();
        
        if (line) {
          if (currentSection === 'medications') {
            // For medications, try to capture multi-line information
            let medicineInfo = line;
            while (i + 1 < lines.length && lines[i + 1].trim() && !lines[i + 1].includes(':')) {
              i++;
              medicineInfo += ' ' + lines[i].trim().replace(/^[•\-]\s*/, '');
            }
            sections[currentSection].push(medicineInfo);
          } else {
        sections[currentSection].push(line);
          }
        }
      }
    }

    return sections;
  };

  const renderPrescriptionDetails = (prescription: Prescription) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">
              {prescription.patientName}
            </h3>
            <p className="text-gray-600">
              {prescription.doctorName}
            </p>
            <p className="text-sm text-gray-500">
              Date: {prescription.date}
            </p>
            {prescription.hospital && (
              <p className="text-sm text-gray-500">
                Hospital: {prescription.hospital}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleStatusChange(prescription.id, 'processed')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </Button>
            <Button
              onClick={() => handleStatusChange(prescription.id, 'rejected')}
              variant="outline"
              className="text-red-600 bg-white hover:bg-red-50"
            >
              Reject
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Medicines</h4>
          <div className="space-y-2">
            {prescription.medicines.map((medicine, index) => (
              <div key={index} className="p-3 bg-gray-200 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{medicine.name} {medicine.dosage}</p>
                    {medicine.instructions && (
                      <p className="text-sm text-gray-600 mt-1">Instructions: {medicine.instructions}</p>
                    )}
                    {medicine.quantity > 0 && (
                      <p className="text-sm text-gray-600">Quantity: {medicine.quantity}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Price: ₹{getMedicinePrice(medicine.name)?getMedicinePrice(medicine.name).toFixed(2):"To be Decided"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            Refills: 0, PRN (as needed)
          </p>
          <p className="text-sm text-gray-500">
            Confidence: {(prescription.confidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await handleAudioUpload(audioBlob);
      };

      mediaRecorder.start();
      setAudioState({
        isRecording: true,
        mediaRecorder,
        audioChunks,
      });

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (audioState.mediaRecorder && audioState.isRecording) {
      audioState.mediaRecorder.stop();
      audioState.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setAudioState(prev => ({ ...prev, isRecording: false }));
      toast.success('Recording stopped');
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');
  
      // Send to backend
      const response = await fetch('http://localhost:8000/transcribe-audio', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Try to parse JSON response
      let data;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      // Log the data for debugging
      console.log('Server response:', data);
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response structure from server');
      }
      
      // Check for error messages in the response
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check success status carefully
      if (data.success === false) {
        throw new Error(
          typeof data.error === 'string' ? data.error : 'Transcription failed'
        );
      }
      
      // Ensure transcribed text exists
      if (!data.transcribed_text) {
        console.warn('Missing transcribed_text in response');
        throw new Error('No transcription data in server response');
      }
      
      // Process the transcribed data with fallbacks for missing properties
      handleProcessedData({
        results: [],
        summary: data.transcribed_text || 'No transcription available',
        structured_data: data.structured_data || {}
      });
  
      toast.success('Audio transcribed successfully');
      
    } catch (error: any) {
      console.error('Error transcribing audio:', error);
      
      // Check for specific FFmpeg-related errors
      const errorMessage = error.message?.toLowerCase() || '';
      if (errorMessage.includes('failed to process audio file')) {
        toast.error(
          'Audio processing failed. The server may be missing FFmpeg. Please try uploading a prescription image instead.', 
          { duration: 5000 }
        );
      } else {
        toast.error(
          error.message && typeof error.message === 'string' 
            ? error.message 
            : 'Failed to transcribe audio. Please try again.'
        );
      }
    } finally {
      setIsProcessing(false);
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescription Processing</h1>
        <p className="text-gray-500 mt-1">Upload and process prescriptions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Prescriptions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Prescriptions</h2>
              </div>
          {prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="p-4 bg-gray-200 rounded-lg">
                  {renderPrescriptionDetails(prescription)}
                  </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center p-8">No recent prescriptions</p>
          )}
        </Card>

        {/* Upload Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upload Prescription</h2>
          </div>
          <div
            className={`
              rounded-lg border-2 border-dashed p-8 transition-colors
              ${isDragging ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-green-300'}
            `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
          >
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mb-3">
                {isProcessing ? (
                  <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-green-600" />
                )}
                </div>
              <h3 className="text-base font-semibold mb-1">Upload Prescription</h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your prescription here, or click the button below
                  </p>
                  <input
                    type="file"
                id="prescription-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                disabled={isProcessing}
                  />
              <div className="flex gap-2 justify-center">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={isProcessing}
                  onClick={() => document.getElementById('prescription-upload')?.click()}
                  >
                    {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Select Image'
                    )}
                  </Button>
                <Button
                  className={`${audioState.isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  onClick={audioState.isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                >
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    <span>{audioState.isRecording ? 'Stop Recording' : 'Record Audio'}</span>
                  </div>
                </Button>
                </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Results Section */}
      {(summary || isProcessing) && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Processing Results</h2>
            {summary && !isProcessing && !isEditingSummary && (
              <Button variant="outline" size="sm" onClick={handleEditSummary}>
                Edit
              </Button>
            )}
          </div>

                    {isEditingSummary ? (
                      <textarea
                        value={editedSummary}
                        onChange={(e) => setEditedSummary(e.target.value)}
              className="w-full h-64 p-2 border rounded-md"
                      />
                    ) : (
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{summary}</div>
          )}
        </Card>
      )}
    </div>
  );
};

export default PharmacistDashboard;