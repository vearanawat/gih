import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, Search, FileText, Clock, Edit, Check, X, 
  AlertCircle, Filter, Download, ShoppingCart, AlertTriangle, Users, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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

// Mock medicine database
const medicineDatabase: MedicineRecord[] = [
  {
    name: "Amoxicillin 500mg",
    short_composition1: "Amoxicillin",
    short_composition2: "Penicillin",
    price: 15.99
  },
  {
    name: "Ibuprofen 400mg",
    short_composition1: "Ibuprofen",
    short_composition2: "NSAIDs",
    price: 8.99
  }
];

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

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setFile(file);
    setPreview(URL.createObjectURL(file));
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/process-prescription', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process prescription');
      }

      const data = await response.json();
      
      // Ensure all required fields are present in the results
      const processedResults = data.results.map(result => ({
        text: result.text,
        confidence: result.confidence,
        box: result.box || [[0, 0], [0, 0], [0, 0], [0, 0]]
      })) as OCRResult[];
      
      setResults(processedResults);

      // Format the summary with sections
      const formattedSummary = `Patient Information:
${data.structured_data.patient_name || 'Unknown Patient'}

Doctor Information:
Dr.Akshara
SMS Hospital

Date:
${data.structured_data.date || new Date().toISOString().split('T')[0]}

Prescribed Medications:
${data.structured_data.medicines?.map(m => 
  `• ${m.name}
  Dosage: ${m.dosage}
  Quantity: ${m.quantity}
  ${m.instructions ? `Instructions: ${m.instructions}` : ''}`
).join('\n\n') || 'No medicines found'}

Special Instructions:
${data.structured_data.medicines?.map(m => m.instructions).filter(Boolean).join('\n') || 'No special instructions'}`

      const summaryText = data.summary || formattedSummary;
      setSummary(summaryText);

      // Add new prescription to the list
      const newPrescription: Prescription = {
        id: String(Date.now()),
        patientName: data.structured_data.patient_name || 'Unknown Patient',
        doctorName: data.structured_data.doctor_name ? 'Dr.Akshara' : 'Unknown Doctor',
        date: data.structured_data.date || new Date().toISOString().split('T')[0],
        medicines: data.structured_data.medicines || [defaultMedicine],
        status: 'pending',
        confidence: data.structured_data.confidence || 0.85,
        originalText: processedResults.map(r => r.text).join('\n'),
        imageUrl: preview || '',
        summary: summaryText
      };

      setPrescriptions(prev => [newPrescription, ...prev]);
      setIsProcessing(false);
      
      toast.success('Prescription processed successfully');
    } catch (error) {
      console.error('Error processing prescription:', error);
      toast.error('Failed to process prescription');
      setIsProcessing(false);
    }
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

    toast.success(`Prescription ${prescriptionId} has been ${newStatus}`);
  };

  // Helper function to find best matching medicine
  const findBestMatchingMedicine = (name: string): MedicineRecord | null => {
    // First try exact match
    let medicine = medicineDatabase.find(med => 
      med.name.toLowerCase() === name.toLowerCase()
    );

    // If no exact match, try matching with compositions
    if (!medicine) {
      medicine = medicineDatabase.find(med => 
        med.short_composition1.toLowerCase().includes(name.toLowerCase()) ||
        med.short_composition2.toLowerCase().includes(name.toLowerCase())
      );
    }

    return medicine;
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

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      if (line.includes('Patient Information:')) {
        currentSection = 'patientInfo';
      } else if (line.includes('Doctor Information:')) {
        currentSection = 'doctorInfo';
      } else if (line.includes('Prescribed Medications:')) {
        currentSection = 'medications';
      } else if (line.includes('Special Instructions:')) {
        currentSection = 'instructions';
      } else if (line.includes('Date:')) {
        currentSection = 'dates';
      } else if (currentSection && !line.includes(':')) {
        sections[currentSection].push(line);
      }
    });

    return sections;
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
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'prescription_audio.wav');

      const response = await fetch('http://localhost:8000/transcribe-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const data = await response.json();
      
      // Create a new prescription from the transcribed data
      const newPrescription: Prescription = {
        id: String(prescriptions.length + 1),
        patientName: data.structured_data.patient_name,
        doctorName: data.structured_data.doctor_name,
        date: data.structured_data.date,
        medicines: data.structured_data.medicines,
        status: 'pending',
        confidence: 0.9,
        originalText: data.transcribed_text,
        imageUrl: '',
        summary: data.transcribed_text,
      };

      setPrescriptions(prev => [...prev, newPrescription]);
      toast.success('Audio transcribed successfully');
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Failed to transcribe audio');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fade-in p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescription Processing</h1>
          <p className="text-gray-500 mt-1">Upload and analyze prescriptions using OCR</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <Card className="bg-white">
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search prescriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

           

            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="bg-gray-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{prescription.patientName}</h3>
                        <p className="text-sm text-gray-500">{prescription.doctorName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {prescription.status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleStatusChange(prescription.id, 'processed')}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleStatusChange(prescription.id, 'rejected')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            prescription.status === 'processed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Medicines</h4>
                        {prescription.medicines.map((medicine) => {
                          const matchedMedicine = findBestMatchingMedicine(medicine.name);
                          const price = matchedMedicine?.price || 100;
                          const quantity = medicine.quantity || 1;
                          return (
                            <div key={medicine.id} className="text-sm text-gray-700">
                              • {medicine.name} - {medicine.dosage}
                              <div className="ml-4 text-gray-500">
                                Quantity: {quantity}
                                <br />
                                Price: ₹{price} per unit
                                {matchedMedicine && (
                                  <span className="text-green-600 ml-1">(from database)</span>
                                )}
                                <br />
                                Total: ₹{quantity * price}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                        <div className="text-sm text-gray-700">
                          <p>Date: {prescription.date}</p>
                          <p>Confidence: {(prescription.confidence * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredPrescriptions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No prescriptions found.</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="bg-white h-fit">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Prescription</h2>
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-green-300 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <Button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setResults([]);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-gray-900 font-medium mb-2">
                    Drop prescription image here
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    or click to select a file
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Prescription
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-white mt-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Detected Text</h2>
            {results && results.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {results && results.length > 0 ? (
              <div className="space-y-4">
                {/* Display Summary First */}
                {summary && (
                  <div className="mb-6 bg-green-50 rounded-lg p-6 border border-green-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">Prescription Summary</h3>
                      {!isEditingSummary ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditSummary}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Summary
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelSummary}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveSummary}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                    {isEditingSummary ? (
                      <textarea
                        value={editedSummary}
                        onChange={(e) => setEditedSummary(e.target.value)}
                        className="w-full h-48 p-3 rounded-md border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      />
                    ) : (
                      <div className="text-gray-700 whitespace-pre-line">
                        {summary}
                      </div>
                    )}
                  </div>
                )}
                {/* Extracted Text Section */}
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Extracted Text</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {results.map((result, index) => (
                      <div key={`result-${index}`} className="text-gray-700 whitespace-pre-wrap font-mono">
                        {result.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No results available. Upload a prescription to begin.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PharmacistDashboard; 