import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, TrendingUp, Package2, ShoppingCart, BarChart3 } from 'lucide-react';
import { toast } from "sonner";

interface MedicineStock {
  id: string;
  name: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  unitPrice: number;
  expiryDate: string;
  manufacturer: string;
  category: string;
  lastRestocked: string;
}

const mockInventory: MedicineStock[] = [
  {
    id: '1',
    name: 'Amoxicillin',
    currentStock: 150,
    minimumStock: 50,
    reorderPoint: 75,
    unitPrice: 15.99,
    expiryDate: '2025-12-31',
    manufacturer: 'Generic Pharma',
    category: 'Antibiotics',
    lastRestocked: '2024-03-01'
  },
  {
    id: '2',
    name: 'Ibuprofen',
    currentStock: 45,
    minimumStock: 50,
    reorderPoint: 75,
    unitPrice: 8.99,
    expiryDate: '2025-06-30',
    manufacturer: 'Pain Relief Inc',
    category: 'Pain Relief',
    lastRestocked: '2024-02-15'
  },
  {
    id: '3',
    name: 'Metformin',
    currentStock: 200,
    minimumStock: 100,
    reorderPoint: 125,
    unitPrice: 12.50,
    expiryDate: '2025-09-30',
    manufacturer: 'Diabetes Care Ltd',
    category: 'Diabetes',
    lastRestocked: '2024-03-10'
  }
];

const InventoryPage = () => {

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Analyze medicine details, including prices, package types, ingredients, and trendz.</p>
        </div>
      </div>
      <div style={{ width: "70vw", height: "70vh", border: "2px solid #ccc" }}>
      <iframe
        src="https://medicaldashboard-eb8zhegowicdqpjccam7gc.streamlit.app?embed=true"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Embedded Content"
      ></iframe>
    </div>

{/* 
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <Card className="bg-white">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Medications</h2>
            
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleAddDrug}
                disabled={!newDrug}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {searchQuery && filteredDrugs.length > 0 && (
              <div className="mb-4 p-2 border rounded-md">
                {filteredDrugs.map((drug) => (
                  <div
                    key={drug}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => {
                      setNewDrug(drug);
                      setSearchQuery('');
                    }}
                  >
                    {drug}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {selectedDrugs.map((drug, index) => (
                <Card key={index} className="bg-gray-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{drug.name}</h3>
                      <button
                        onClick={() => handleRemoveDrug(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <Input
                        type="text"
                        placeholder="Dosage"
                        value={drug.dosage}
                        onChange={(e) => {
                          const updatedDrugs = [...selectedDrugs];
                          updatedDrugs[index].dosage = e.target.value;
                          setSelectedDrugs(updatedDrugs);
                        }}
                      />
                      <Input
                        type="text"
                        placeholder="Frequency"
                        value={drug.frequency}
                        onChange={(e) => {
                          const updatedDrugs = [...selectedDrugs];
                          updatedDrugs[index].frequency = e.target.value;
                          setSelectedDrugs(updatedDrugs);
                        }}
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {selectedDrugs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No medications selected.</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="bg-white h-fit">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interactions Analysis</h2>
            
            {interactions.length > 0 ? (
              <div className="space-y-4">
                {interactions.map((interaction, index) => (
                  <Card key={index} className="bg-gray-50">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-5 h-5 ${
                          interaction.severity === 'high' ? 'text-red-500' :
                          interaction.severity === 'moderate' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`} />
                        <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(interaction.severity)}`}>
                          {interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)} Risk
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-2">
                        {interaction.drugs.join(' + ')}
                      </h3>
                      
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700">{interaction.description}</p>
                        <p className="text-gray-700">
                          <span className="font-medium">Recommendation: </span>
                          {interaction.recommendation}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">
                  No interactions detected. Add medications to check for potential interactions.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div> */}
    </div>
  );
};
//   const [inventory, setInventory] = useState<MedicineStock[]>(mockInventory);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState<string>('all');
//   const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'normal' | 'high'>('all');

//   const categories = Array.from(new Set(inventory.map(item => item.category)));

//   const getStockStatus = (item: MedicineStock) => {
//     if (item.currentStock <= item.minimumStock) return 'low';
//     if (item.currentStock <= item.reorderPoint) return 'medium';
//     return 'high';
//   };

//   const filteredInventory = inventory.filter(item => {
//     const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
//     const stockStatus = getStockStatus(item);
//     const matchesStock = stockFilter === 'all' ||
//                         (stockFilter === 'low' && stockStatus === 'low') ||
//                         (stockFilter === 'normal' && stockStatus === 'medium') ||
//                         (stockFilter === 'high' && stockStatus === 'high');

//     return matchesSearch && matchesCategory && matchesStock;
//   });

//   const stats = [
//     {
//       title: 'Total Items',
//       value: inventory.length,
//       icon: Package2,
//       color: 'text-blue-600'
//     },
//     {
//       title: 'Low Stock Items',
//       value: inventory.filter(item => getStockStatus(item) === 'low').length,
//       icon: AlertCircle,
//       color: 'text-red-600'
//     },
//     {
//       title: 'Need Reorder',
//       value: inventory.filter(item => item.currentStock <= item.reorderPoint).length,
//       icon: ShoppingCart,
//       color: 'text-yellow-600'
//     },
//     {
//       title: 'Total Value',
//       value: `₹${inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0).toLocaleString()}`,
//       icon: TrendingUp,
//       color: 'text-green-600'
//     }
//   ];

//   const handleUpdateStock = (id: string, newStock: number) => {
//     setInventory(prev => prev.map(item => 
//       item.id === id ? { ...item, currentStock: newStock, lastRestocked: new Date().toISOString().split('T')[0] } : item
//     ));
//     toast.success('Stock updated successfully');
//   };

//   return (
//     <div className="fade-in space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
//           <p className="text-gray-500 mt-1">Track and manage medicine stock levels</p>
//         </div>
//         <Button className="bg-green-600 hover:bg-green-700 text-white">
//           Add New Item
//         </Button>
//       </div>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {stats.map((stat, index) => (
//           <Card key={index} className="p-4">
//             <div className="flex items-start justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">{stat.title}</p>
//                 <p className="mt-1 text-lg font-semibold">{stat.value}</p>
//               </div>
//               <stat.icon className={`w-5 h-5 ${stat.color}`} />
//             </div>
//           </Card>
//         ))}
//       </div>

//       {/* Filters */}
//       <Card className="bg-white p-6">
//         <div className="flex flex-wrap gap-4 mb-6">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <Input
//               type="text"
//               placeholder="Search by medicine name or manufacturer..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           <select
//             className="border rounded-md px-3"
//             value={categoryFilter}
//             onChange={(e) => setCategoryFilter(e.target.value)}
//           >
//             <option value="all">All Categories</option>
//             {categories.map(category => (
//               <option key={category} value={category}>{category}</option>
//             ))}
//           </select>
//           <select
//             className="border rounded-md px-3"
//             value={stockFilter}
//             onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'normal' | 'high')}
//           >
//             <option value="all">All Stock Levels</option>
//             <option value="low">Low Stock</option>
//             <option value="normal">Normal Stock</option>
//             <option value="high">High Stock</option>
//           </select>
//         </div>

//         {/* Inventory Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b">
//                 <th className="text-left py-3 px-4">Medicine Name</th>
//                 <th className="text-left py-3 px-4">Category</th>
//                 <th className="text-left py-3 px-4">Current Stock</th>
//                 <th className="text-left py-3 px-4">Status</th>
//                 <th className="text-left py-3 px-4">Unit Price</th>
//                 <th className="text-left py-3 px-4">Expiry Date</th>
//                 <th className="text-left py-3 px-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredInventory.map((item) => {
//                 const stockStatus = getStockStatus(item);
//                 const statusColor = {
//                   low: 'text-red-600 bg-red-50',
//                   medium: 'text-yellow-600 bg-yellow-50',
//                   high: 'text-green-600 bg-green-50'
//                 }[stockStatus];

//                 return (
//                   <tr key={item.id} className="border-b hover:bg-gray-50">
//                     <td className="py-3 px-4">
//                       <div>
//                         <p className="font-medium">{item.name}</p>
//                         <p className="text-sm text-gray-500">{item.manufacturer}</p>
//                       </div>
//                     </td>
//                     <td className="py-3 px-4">{item.category}</td>
//                     <td className="py-3 px-4">{item.currentStock}</td>
//                     <td className="py-3 px-4">
//                       <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
//                         {stockStatus.charAt(0).toUpperCase() + stockStatus.slice(1)}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4">₹{item.unitPrice.toFixed(2)}</td>
//                     <td className="py-3 px-4">{item.expiryDate}</td>
//                     <td className="py-3 px-4">
//                       <div className="flex gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleUpdateStock(item.id, item.currentStock + 10)}
//                         >
//                           Update Stock
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {filteredInventory.length === 0 && (
//             <div className="text-center py-8">
//               <p className="text-gray-500">No inventory items found.</p>
//             </div>
//           )}
//         </div>
//       </Card>

//       {/* Analytics Section */}
//       <Card className="p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-lg font-semibold">Inventory Analytics</h2>
//           <BarChart3 className="w-5 h-5 text-gray-400" />
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="p-4 bg-gray-50 rounded-lg">
//             <h3 className="text-sm font-medium text-gray-600 mb-2">Stock Distribution</h3>
//             <div className="space-y-2">
//               {['Low', 'Normal', 'High'].map(level => {
//                 const count = inventory.filter(item => 
//                   getStockStatus(item) === level.toLowerCase()
//                 ).length;
//                 const percentage = (count / inventory.length) * 100;
//                 return (
//                   <div key={level} className="flex items-center justify-between">
//                     <span className="text-sm">{level}</span>
//                     <div className="flex-1 mx-4">
//                       <div className="h-2 bg-gray-200 rounded-full">
//                         <div
//                           className={`h-full rounded-full ${
//                             level === 'Low' ? 'bg-red-500' :
//                             level === 'Normal' ? 'bg-yellow-500' : 'bg-green-500'
//                           }`}
//                           style={{ width: `${percentage}%` }}
//                         />
//                       </div>
//                     </div>
//                     <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
          
//           <div className="p-4 bg-gray-50 rounded-lg">
//             <h3 className="text-sm font-medium text-gray-600 mb-2">Category Distribution</h3>
//             <div className="space-y-2">
//               {categories.map(category => {
//                 const count = inventory.filter(item => item.category === category).length;
//                 const percentage = (count / inventory.length) * 100;
//                 return (
//                   <div key={category} className="flex items-center justify-between">
//                     <span className="text-sm">{category}</span>
//                     <div className="flex-1 mx-4">
//                       <div className="h-2 bg-gray-200 rounded-full">
//                         <div
//                           className="h-full rounded-full bg-blue-500"
//                           style={{ width: `${percentage}%` }}
//                         />
//                       </div>
//                     </div>
//                     <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="p-4 bg-gray-50 rounded-lg">
//             <h3 className="text-sm font-medium text-gray-600 mb-2">Reorder Suggestions</h3>
//             <div className="space-y-2">
//               {inventory
//                 .filter(item => item.currentStock <= item.reorderPoint)
//                 .slice(0, 5)
//                 .map(item => (
//                   <div key={item.id} className="flex items-center justify-between">
//                     <span className="text-sm">{item.name}</span>
//                     <span className="text-sm text-red-500">
//                       {item.currentStock} / {item.reorderPoint}
//                     </span>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

export default InventoryPage;