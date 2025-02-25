import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, FileText, User } from 'lucide-react';

const mockHistory = [
  {
    id: 1,
    patientName: "John Doe",
    date: "2024-03-15",
    diagnosis: "Acute Bronchitis",
    symptoms: ["Persistent cough", "Chest congestion", "Fatigue"],
    treatment: "Prescribed antibiotics and rest",
    followUp: "2024-03-22"
  },
  {
    id: 2,
    patientName: "Jane Smith",
    date: "2024-03-14",
    diagnosis: "Migraine",
    symptoms: ["Severe headache", "Nausea", "Light sensitivity"],
    treatment: "Prescribed pain medication and recommended stress management",
    followUp: "2024-03-28"
  },
  // Add more mock data as needed
];

const DoctorHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState(mockHistory);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockHistory.filter(record => 
      record.patientName.toLowerCase().includes(query.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredHistory(filtered);
  };

  return (
    <div className="fade-in p-4 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient History</h1>
        <p className="text-gray-500 mt-1">View and manage patient diagnoses history</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by patient name or diagnosis..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Export Records
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredHistory.map((record) => (
          <Card key={record.id} className="bg-white shadow-sm">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.patientName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Visited on {record.date}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                  <p className="text-gray-700">{record.diagnosis}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {record.symptoms.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Treatment</h4>
                  <p className="text-gray-700">{record.treatment}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Follow-up</h4>
                  <p className="text-gray-700">Scheduled for {record.followUp}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredHistory.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No records found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorHistory; 