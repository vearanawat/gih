import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, Search, FileText, Clock, Edit, Check, X, 
  AlertCircle, Filter, Download, ShoppingCart, AlertTriangle, Users
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

const PharmacistDashboard = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(mockPrescriptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Here you would typically upload the file and process it
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

      toast.success('Prescription uploaded', {
        description: 'The prescription has been successfully processed.',
      });

      // Add a new mock prescription
      const newPrescription: Prescription = {
        id: String(Date.now()),
        patientName: 'New Patient',
        doctorName: 'Dr. Johnson',
        date: new Date().toISOString().split('T')[0],
        medicines: [],
        status: 'pending',
        confidence: 0.85,
        originalText: '',
        imageUrl: URL.createObjectURL(files[0])
      };

      setPrescriptions(prev => [newPrescription, ...prev]);
    } catch (error) {
      toast.error('Upload failed', {
        description: 'There was an error processing the prescription.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileUpload(event.dataTransfer.files);
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

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescription Processing</h1>
          <p className="text-gray-500 mt-1">Review and verify prescriptions</p>
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
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">
                Drag and drop a prescription image here, or click to select
              </p>
              <input
                type="file"
                id="prescription-upload"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
                accept="image/*"
              />
              <Button
                onClick={() => document.getElementById('prescription-upload')?.click()}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? 'Processing...' : 'Select File'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PharmacistDashboard; 