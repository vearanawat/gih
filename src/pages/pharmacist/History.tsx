import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, Calendar, FileText, User, Package } from 'lucide-react';

interface HistoryRecord {
  id: string;
  type: 'prescription' | 'order';
  patientName: string;
  date: string;
  status: string;
  details: {
    medicines: Array<{
      name: string;
      dosage: string;
      quantity: number;
    }>;
    total?: number;
    prescribedBy?: string;
    notes?: string;
  };
}

const mockHistory: HistoryRecord[] = [
  {
    id: 'PRE-001',
    type: 'prescription',
    patientName: 'John Doe',
    date: '2024-03-15',
    status: 'processed',
    details: {
      medicines: [
        { name: 'Amoxicillin', dosage: '500mg', quantity: 30 },
        { name: 'Ibuprofen', dosage: '400mg', quantity: 20 }
      ],
      prescribedBy: 'Dr. Smith',
      notes: 'Take with food'
    }
  },
  {
    id: 'ORD-001',
    type: 'order',
    patientName: 'Jane Smith',
    date: '2024-03-14',
    status: 'completed',
    details: {
      medicines: [
        { name: 'Metformin', dosage: '850mg', quantity: 60 }
      ],
      total: 32.50
    }
  }
];

const PharmacistHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'prescription' | 'order'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredHistory = mockHistory.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesDate = (!startDate || record.date >= startDate) &&
                       (!endDate || record.date <= endDate);
    return matchesSearch && matchesType && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: 'prescription' | 'order') => {
    return type === 'prescription' ? (
      <FileText className="w-5 h-5 text-blue-500" />
    ) : (
      <Package className="w-5 h-5 text-green-500" />
    );
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-gray-500 mt-1">View prescription and order history</p>
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

      <Card className="bg-white p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="border rounded-md px-3"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'prescription' | 'order')}
          >
            <option value="all">All Types</option>
            <option value="prescription">Prescriptions</option>
            <option value="order">Orders</option>
          </select>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>

        <div className="space-y-4">
          {filteredHistory.map((record) => (
            <Card key={record.id} className="bg-gray-50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(record.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{record.id}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{record.patientName}</span>
                        <Calendar className="w-4 h-4 ml-2" />
                        <span>{record.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Medicines</h4>
                    <div className="space-y-1">
                      {record.details.medicines.map((medicine, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          • {medicine.name} ({medicine.dosage}) x{medicine.quantity}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      {record.type === 'prescription' && record.details.prescribedBy && (
                        <p>Prescribed by: {record.details.prescribedBy}</p>
                      )}
                      {record.type === 'order' && record.details.total && (
                        <p>Total: ₹{record.details.total.toFixed(2)}</p>
                      )}
                      {record.details.notes && (
                        <p>Notes: {record.details.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No records found.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PharmacistHistory; 