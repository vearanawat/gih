import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, Package2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { useLocation } from 'react-router-dom';

interface Medicine {
  name: string;
  dosage: string;
  quantity: number;
  instructions: string;
  confidence: number;
}

interface Order {
  id: string;
  patientName: string;
  medicines: Medicine[];
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  total: number;
  priority: 'normal' | 'urgent';
  imageUrl?: string;
}

interface MedicineRecord {
  name: string;
  dosage_forms: string[];
  strengths: string[];
  manufacturer: string;
  price: number;  // Price per unit
}

// Mock medicine database
const medicineDatabase: MedicineRecord[] = [
  {
    name: "Amoxicillin",
    dosage_forms: ["Capsule", "Tablet", "Suspension"],
    strengths: ["250mg", "500mg", "875mg"],
    manufacturer: "Generic Pharma",
    price: 15.99
  },
  {
    name: "Ibuprofen",
    dosage_forms: ["Tablet", "Capsule", "Suspension"],
    strengths: ["200mg", "400mg", "600mg"],
    manufacturer: "Pain Relief Inc",
    price: 8.99
  }
];

// Helper function to get medicine price
const getMedicinePrice = (name: string): number => {
  const medicine = medicineDatabase.find(med => 
    med.name.toLowerCase() === name.toLowerCase()
  );
  return medicine?.price || 100; // Default price of 100 if medicine not found
};

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    patientName: "John Doe",
    medicines: [
      {
        name: "Amoxicillin",
        dosage: "500mg",
        quantity: 30,
        instructions: "Take one capsule three times daily",
        confidence: 0.95
      }
    ],
    status: "pending",
    date: "2024-03-15",
    total: 479.70, // 30 * 15.99
    priority: "normal"
  },
  {
    id: "ORD-002",
    patientName: "Jane Smith",
    medicines: [
      {
        name: "Ibuprofen",
        dosage: "400mg",
        quantity: 20,
        instructions: "Take as needed for pain",
        confidence: 0.98
      }
    ],
    status: "processing",
    date: "2024-03-15",
    total: 179.80, // 20 * 8.99
    priority: "urgent"
  }
];

const findMatchingMedicine = (name: string): MedicineRecord | null => {
  return medicineDatabase.find(med => 
    med.name.toLowerCase() === name.toLowerCase()
  ) || null;
};

const PharmacistOrders = () => {
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>(() => {
    // If there's a new order in the location state, add it to the mock orders
    const newOrder = location.state?.newOrder;
    return newOrder ? [newOrder, ...mockOrders] : mockOrders;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Order['priority'] | 'all'>('all');

  // Show toast for new order
  useEffect(() => {
    if (location.state?.newOrder) {
      toast.success('New order created', {
        description: `Order ${location.state.newOrder.id} has been created and is pending processing.`
      });
      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast.success(`Order ${orderId} marked as ${newStatus}`);
  };

  const handleMedicineEdit = (orderId: string, medicineIndex: number, field: keyof Medicine, value: string | number) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedMedicines = [...order.medicines];
        updatedMedicines[medicineIndex] = {
          ...updatedMedicines[medicineIndex],
          [field]: value
        };
        return { ...order, medicines: updatedMedicines };
      }
      return order;
    }));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Package2 className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const MedicineDisplay = ({ medicine, index, orderId }: { medicine: Medicine; index: number; orderId: string }) => {
    const [matchedDetails, setMatchedDetails] = useState<MedicineRecord | null>(null);
    
    React.useEffect(() => {
      const match = findMatchingMedicine(medicine.name);
      setMatchedDetails(match);
    }, [medicine.name]);

    return (
      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{medicine.name}</h3>
              <div className="text-sm text-gray-500">
                Confidence: {(medicine.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {matchedDetails && (
            <div className="text-sm text-gray-600 space-y-1">
              <p>Available forms: {matchedDetails.dosage_forms.join(', ')}</p>
              <p>Strengths: {matchedDetails.strengths.join(', ')}</p>
              <p>Manufacturer: {matchedDetails.manufacturer}</p>
              <p>Price: ₹{matchedDetails.price.toFixed(2)}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={medicine.dosage}
              onChange={(e) => handleMedicineEdit(orderId, index, 'dosage', e.target.value)}
              placeholder="Dosage"
              className="text-sm"
            />
            <Input
              type="number"
              value={medicine.quantity}
              onChange={(e) => handleMedicineEdit(orderId, index, 'quantity', parseInt(e.target.value))}
              placeholder="Quantity"
              className="text-sm"
            />
          </div>
          <Input
            value={medicine.instructions}
            onChange={(e) => handleMedicineEdit(orderId, index, 'instructions', e.target.value)}
            placeholder="Instructions"
            className="text-sm"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage and process medication orders</p>
        </div>
      </div>

      <Card className="bg-white p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by patient name or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="border rounded-md px-3"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="border rounded-md px-3"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Order['priority'] | 'all')}
          >
            <option value="all">All Priority</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="bg-gray-50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{order.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.priority === 'urgent' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <User className="w-4 h-4" />
                      <span>{order.patientName}</span>
                      <Calendar className="w-4 h-4 ml-2" />
                      <span>{order.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleStatusChange(order.id, 'processing')}
                        >
                          Process
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleStatusChange(order.id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {order.medicines.map((medicine, index) => (
                    <MedicineDisplay
                      key={index}
                      medicine={medicine}
                      index={index}
                      orderId={order.id}
                    />
                  ))}
                  <div className="flex justify-end">
                    <p className="text-lg font-semibold text-gray-900">
                      Total: ₹{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders found.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PharmacistOrders;
