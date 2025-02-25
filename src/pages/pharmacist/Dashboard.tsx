import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, Search, FileText, Clock, Edit, Check, X, 
  AlertCircle, Filter, Download, ShoppingCart, AlertTriangle, Users, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

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
    imageUrl: ''
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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const uploadFile = files[0];
    setFile(uploadFile);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await fetch('http://localhost:8000/process_prescription', {
        method: 'POST',
        body: formData,
      });

      const data: ProcessedResult = await response.json();
      
      const processedResults = data.results.map(result => ({
        text: result.text,
        confidence: result.confidence,
        box: Array.isArray(result.box) ? result.box : [[0, 0], [0, 0], [0, 0], [0, 0]]
      })) as OCRResult[];
      
      setResults(processedResults);
      setSummary(data.summary || 'No summary available');

      const newPrescription: Prescription = {
        id: String(Date.now()),
        patientName: data.structured_data.patient_name || 'Unknown Patient',
        doctorName: data.structured_data.doctor_name || 'Unknown Doctor',
        date: data.structured_data.date || new Date().toISOString().split('T')[0],
        medicines: data.structured_data.medicines || [defaultMedicine],
        status: 'pending',
        confidence: 0.85,
        originalText: processedResults.map(r => r.text).join('\n'),
        imageUrl: URL.createObjectURL(uploadFile)
      };

      setPrescriptions(prev => [newPrescription, ...prev]);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing prescription:', error);
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
    setPrescriptions(prev =>
      prev.map(p =>
        p.id === prescriptionId ? { ...p, status: newStatus } : p
      )
    );

    toast.success(`Prescription ${newStatus}`, {
      description: `The prescription has been marked as ${newStatus}.`,
    });
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
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = () => {
    const combinedText = results.map(result => result.text).join('\n');
    setEditedText(combinedText);
    setEditMode(true);
  };

  const handleSave = () => {
    // Create new results with default box coordinates for edited text
    const newResults: OCRResult[] = editedText.split('\n').map(text => ({
      text: text.trim(),
      confidence: 1.0, // Default confidence since we can't determine it for edited text
      box: [[0, 0], [100, 0], [100, 20], [0, 20]] // Default box coordinates
    }));
    
    setResults(newResults);
    setEditMode(false);
    setEditedText('');
    toast.success('Text updated successfully');
  };

  return (
    <div className="fade-in space-y-6">
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
                        {prescription.medicines.map((medicine) => (
                          <div key={medicine.id} className="text-sm text-gray-700">
                            • {medicine.name} - {medicine.dosage}
                          </div>
                        ))}
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
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    id="file-upload"
                  />
                  <Button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    variant="outline"
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>

            {file && (
              <Button
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleFileUpload(new DataTransfer().files)}
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
                    Process Prescription
                  </>
                )}
              </Button>
            )}
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
                {/* Summary Section */}
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-gray-700">{summary}</p>
                </div>
                
                {/* Extracted Text Section */}
                <div className="p-4 bg-white rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Extracted Text</h3>
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-900 font-mono">{result.text}</p>
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