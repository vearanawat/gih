import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, Search, Loader2, FileText, AlertCircle, 
  Edit, Check, X, Download, ChevronUp, ChevronDown 
} from "lucide-react";
import { toast } from "sonner";
import { analyzePrescription } from "../../utils/ml";
import { findMatchingMedicine } from "../../utils/medicineDatabase";

interface Medicine {
  name: string;
  dosage?: string;
  quantity?: number;
  instructions?: string;
  confidence: number;
}

interface PrescriptionDetails {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  medicines: Medicine[];
  status: 'pending' | 'processed' | 'rejected';
  confidence: number;
  raw_text: string;
  imageUrl?: string;
}

interface OrderRequest {
  prescriptionId: string;
  patientName: string;
  doctorName: string;
  date: string;
  medicines: Medicine[];
  imageUrl?: string;
}

const Prescriptions = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prescription, setPrescription] = useState<PrescriptionDetails | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<{index: number, field: string} | null>(null);
  const [editingText, setEditingText] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [showImage, setShowImage] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleAnalysis(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      handleAnalysis(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleAnalysis = async (file: File) => {
    setAnalyzing(true);
    
    try {
      // Create form data to send the image
      const formData = new FormData();
      formData.append('prescription_image', file);

      // Call your backend API
      const response = await fetch('http://localhost:8000/api/analyze-prescription', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('OCR analysis failed');
      }

      const result = await response.json();
      
      // Update prescription state with OCR results
      setPrescription({
        id: new Date().toISOString(),
        patientName: result.patient_name || 'Unknown Patient',
        doctorName: result.doctor_name || 'Unknown Doctor',
        date: result.date || new Date().toISOString(),
        medicines: result.medicines || [],
        status: 'pending',
        confidence: result.confidence,
        raw_text: result.extracted_text,
        imageUrl: URL.createObjectURL(file)
      });

      toast.success('Analysis complete!');

    } catch (error: any) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed", { 
        description: error.message || "Please try with a clearer image" 
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMedicineEdit = (index: number, field: string, value: string | number) => {
    if (!prescription) return;

    const updatedMedicines = [...prescription.medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [field]: value
    };

    setPrescription({
      ...prescription,
      medicines: updatedMedicines
    });
  };

  const handlePlaceOrder = async () => {
    if (!prescription) return;

    try {
      setAnalyzing(true); // Reuse analyzing state to show loading
      
      // Validate medicines have required fields
      const invalidMedicines = prescription.medicines.filter(
        med => !med.dosage || !med.quantity
      );

      if (invalidMedicines.length > 0) {
        toast.error('Missing medicine details', {
          description: 'Please fill in dosage and quantity for all medicines'
        });
        return;
      }

      const orderRequest: OrderRequest = {
        prescriptionId: prescription.id,
        patientName: prescription.patientName,
        doctorName: prescription.doctorName,
        date: prescription.date,
        medicines: prescription.medicines,
        imageUrl: prescription.imageUrl
      };

      const response = await fetch('http://localhost:8000/prescriptions/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const result = await response.json();
      
      // Update prescription status
      setPrescription({
        ...prescription,
        status: 'processed'
      });

      toast.success('Order placed successfully!', {
        description: 'Your prescription has been sent for processing'
      });

    } catch (error: any) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order', {
        description: error.message || 'Please try again later'
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  const handleTextEdit = () => {
    if (editingText && prescription) {
      setPrescription({
        ...prescription,
        raw_text: editedText
      });
    } else if (prescription) {
      setEditedText(prescription.raw_text);
    }
    setEditingText(!editingText);
  };

  // Add this component for better text display
  const ExtractedTextDisplay = ({ text, confidence }: { text: string, confidence: number }) => {
    return (
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-700">Extracted Text</h4>
          <span className="text-sm px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
            Confidence: {confidence.toFixed(1)}*100%
          </span>
        </div>
        <div className="space-y-2">
          {text.split('\n').map((line, index) => (
            <div 
              key={index} 
              className={`p-2 rounded ${
                line.match(/\b(Tab|Cap|Syp|Inj|Tablet|Capsule|Syrup|Injection)\b/i)
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-50 text-gray-700'
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MedicineDisplay = ({ medicine }: { medicine: Medicine }) => {
    const [matchedDetails, setMatchedDetails] = useState<MedicineRecord | null>(null);
    
    useEffect(() => {
      const match = findMatchingMedicine(medicine.name);
      setMatchedDetails(match);
    }, [medicine.name]);

    return (
      <div className="border rounded-lg p-4 mb-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium">{medicine.name}</h5>
              {matchedDetails && (
                <p className="text-sm text-gray-500">
                  Generic: {matchedDetails.generic_name}
                </p>
              )}
            </div>
            <span className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
              {medicine.confidence.toFixed(1)}% match
            </span>
          </div>
          
          {matchedDetails && (
            <div className="bg-gray-50 p-2 rounded text-sm">
              <p>Available forms: {matchedDetails.dosage_forms.join(', ')}</p>
              <p>Strengths: {matchedDetails.strengths.join(', ')}</p>
              <p>Manufacturer: {matchedDetails.manufacturer}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={medicine.dosage}
              onChange={(e) => handleMedicineEdit(index, 'dosage', e.target.value)}
              placeholder="Dosage"
              className="text-sm"
            />
            <Input
              type="number"
              value={medicine.quantity}
              onChange={(e) => handleMedicineEdit(index, 'quantity', parseInt(e.target.value))}
              placeholder="Quantity"
              className="text-sm"
            />
          </div>
          <Input
            value={medicine.instructions}
            onChange={(e) => handleMedicineEdit(index, 'instructions', e.target.value)}
            placeholder="Instructions"
            className="text-sm"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in p-4 max-w-7xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Upload Prescription</h1>
        <p className="text-gray-500 mt-1">Upload and manage your prescriptions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Upload and Image Section (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upload Box */}
      <Card className="bg-white shadow-sm">
        <div className="p-6">
          <div
            className="rounded-lg border-2 border-dashed border-gray-200 p-8 hover:border-green-300 transition-colors text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
              {analyzing ? (
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-green-600" />
              )}
            </div>
            <h3 className="text-base font-semibold mb-1">Select or Drop Files</h3>
            <p className="text-sm text-gray-500 mb-4">
              {analyzing ? "Analyzing prescription..." : "Drag and drop your prescription here, or click below"}
            </p>
            <input
              type="file"
              id="prescription-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={analyzing}
            />
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5"
              disabled={analyzing}
              onClick={() => document.getElementById("prescription-upload")?.click()}
            >
              {analyzing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Select File"
              )}
            </Button>
          </div>
        </div>
      </Card>

          {/* Prescription Image with Collapsible View */}
          {prescription?.imageUrl && (
            <Card className="bg-white shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setShowImage(!showImage)}
                  >
                    <h4 className="font-medium">
                      {showImage ? 'Hide Original Prescription' : 'View Original Prescription'}
                    </h4>
                    {showImage ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = prescription.imageUrl!;
                      link.download = 'prescription.jpg';
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                {showImage && (
                  <div className="transition-all duration-200 ease-in-out">
                    <img
                      src={prescription.imageUrl}
                      alt="Prescription"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Extracted Information (2 columns) */}
        <div className="lg:col-span-2">
          {prescription ? (
            <Card className="bg-white shadow-sm">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{prescription.patientName}</h3>
                  <p className="text-gray-500">{prescription.doctorName}</p>
                  <p className="text-gray-500">
                    {new Date(prescription.date).toLocaleDateString()}
                  </p>
              </div>

                <div className="space-y-6">
                  {/* Extracted Text with Edit Option */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Extracted Text</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleTextEdit}
                      >
                        {editingText ? (
                          <Check className="w-4 h-4 mr-2" />
                        ) : (
                          <Edit className="w-4 h-4 mr-2" />
                        )}
                        {editingText ? 'Save' : 'Edit'}
                      </Button>
                    </div>
                    {editingText ? (
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full h-40 p-3 text-sm border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <ExtractedTextDisplay 
                        text={prescription.raw_text} 
                        confidence={prescription.confidence} 
                      />
                  )}
                </div>

                  {/* Medicines Section */}
                <div>
                    <h4 className="font-medium mb-2">Detected Medicines</h4>
                    {prescription.medicines.map((medicine, index) => (
                      <MedicineDisplay key={index} medicine={medicine} />
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPrescription(null)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={!prescription.medicines.length}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Place Order
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-white shadow-sm">
              <div className="p-6 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-lg font-medium mb-1">No Prescription Selected</h3>
                <p className="text-sm">Upload a prescription to see the analysis results here</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
