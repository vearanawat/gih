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
  Eye,
  Share2,
  AlertCircle
} from 'lucide-react';

interface DiagnosticTest {
  id: string;
  name: string;
  date: string;
  category: 'blood' | 'imaging' | 'pathology' | 'other';
  doctor: string;
  status: 'normal' | 'abnormal' | 'pending';
  results: Array<{
    parameter: string;
    value: string;
    unit: string;
    reference: string;
    isAbnormal: boolean;
  }>;
  notes?: string;
}

const mockTests: DiagnosticTest[] = [
  {
    id: 'TEST-001',
    name: 'Complete Blood Count',
    date: '2024-03-15',
    category: 'blood',
    doctor: 'Dr. Sarah Wilson',
    status: 'normal',
    results: [
      {
        parameter: 'Hemoglobin',
        value: '14.2',
        unit: 'g/dL',
        reference: '12.0-15.5',
        isAbnormal: false
      },
      {
        parameter: 'White Blood Cells',
        value: '7.5',
        unit: 'K/µL',
        reference: '4.5-11.0',
        isAbnormal: false
      }
    ]
  },
  {
    id: 'TEST-002',
    name: 'Chest X-Ray',
    date: '2024-03-10',
    category: 'imaging',
    doctor: 'Dr. Michael Chen',
    status: 'abnormal',
    results: [
      {
        parameter: 'Lung Fields',
        value: 'Mild infiltrates noted',
        unit: '',
        reference: 'Clear lung fields',
        isAbnormal: true
      }
    ],
    notes: 'Follow-up recommended in 2 weeks'
  }
];

const PatientDiagnostics = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tests, setTests] = useState(mockTests);

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800';
      case 'abnormal':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fade-in space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diagnostic Tests</h1>
          <p className="text-gray-500 mt-1">View your test results and reports</p>
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
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="border rounded-md px-3 py-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="blood">Blood Tests</option>
            <option value="imaging">Imaging</option>
            <option value="pathology">Pathology</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredTests.map((test) => (
            <Card key={test.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{test.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(test.status)}`}>
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{test.date}</span>
                      <span>•</span>
                      <span>{test.doctor}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {test.results.map((result, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{result.parameter}</p>
                        <p className="text-sm text-gray-500">
                          Reference: {result.reference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${result.isAbnormal ? 'text-red-600' : 'text-green-600'}`}>
                          {result.value} {result.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {test.notes && (
                <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <p>{test.notes}</p>
                </div>
              )}
            </Card>
          ))}

          {filteredTests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No tests found matching your search.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PatientDiagnostics;
