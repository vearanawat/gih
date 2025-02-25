import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Calendar, 
  FileText, 
  Download, 
  Filter,
  User,
  Stethoscope,
  Pill,
  Activity,
  AlertCircle
} from 'lucide-react';

interface MedicalRecord {
  id: string;
  date: string;
  type: 'visit' | 'diagnosis' | 'procedure' | 'vaccination';
  doctor: string;
  description: string;
  details: {
    symptoms?: string[];
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    followUp?: string;
  };
}

const mockHistory: MedicalRecord[] = [
  {
    id: 'VIS-001',
    date: '2024-03-15',
    type: 'visit',
    doctor: 'Dr. Sarah Wilson',
    description: 'Regular Checkup',
    details: {
      symptoms: ['Mild fever', 'Cough'],
      diagnosis: 'Upper respiratory infection',
      treatment: 'Prescribed antibiotics and rest',
      followUp: '2024-03-29'
    }
  },
  {
    id: 'PROC-001',
    date: '2024-02-20',
    type: 'procedure',
    doctor: 'Dr. Michael Chen',
    description: 'Minor Surgery',
    details: {
      notes: 'Successful removal of skin lesion',
      followUp: '2024-03-05'
    }
  },
  {
    id: 'VAC-001',
    date: '2024-01-10',
    type: 'vaccination',
    doctor: 'Dr. Emily Brown',
    description: 'Annual Flu Shot',
    details: {
      notes: 'Seasonal influenza vaccination administered'
    }
  }
];

const PatientHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredHistory = mockHistory.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.doctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || record.type === selectedType;
    const matchesDate = (!startDate || record.date >= startDate) &&
                       (!endDate || record.date <= endDate);
    return matchesSearch && matchesType && matchesDate;
  });

  const getTypeIcon = (type: MedicalRecord['type']) => {
    switch (type) {
      case 'visit':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'diagnosis':
        return <Stethoscope className="w-5 h-5 text-purple-500" />;
      case 'procedure':
        return <Activity className="w-5 h-5 text-orange-500" />;
      case 'vaccination':
        return <Pill className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="fade-in space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
          <p className="text-gray-500 mt-1">View your complete medical history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search medical records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="border rounded-md px-3 py-2"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="visit">Visits</option>
            <option value="diagnosis">Diagnoses</option>
            <option value="procedure">Procedures</option>
            <option value="vaccination">Vaccinations</option>
          </select>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
            placeholder="Start Date"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
            placeholder="End Date"
          />
        </div>

        <div className="space-y-4">
          {filteredHistory.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTypeIcon(record.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{record.description}</h3>
                      <span className="text-sm text-gray-500">({record.id})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{record.date}</span>
                      <span>•</span>
                      <span>{record.doctor}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>

              <div className="space-y-3">
                {record.details.symptoms && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium mb-1">Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      {record.details.symptoms.map((symptom, index) => (
                        <span key={index} className="px-2 py-1 bg-white rounded text-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {record.details.diagnosis && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium mb-1">Diagnosis</p>
                    <p className="text-sm text-gray-700">{record.details.diagnosis}</p>
                  </div>
                )}

                {record.details.treatment && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium mb-1">Treatment</p>
                    <p className="text-sm text-gray-700">{record.details.treatment}</p>
                  </div>
                )}

                {record.details.notes && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <p>{record.details.notes}</p>
                  </div>
                )}

                {record.details.followUp && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                    <Calendar className="w-4 h-4" />
                    <p>Follow-up scheduled for {record.details.followUp}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No records found matching your search.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PatientHistory;