import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Info, Plus, X } from 'lucide-react';
import { toast } from "sonner";

interface Drug{
  name: string;
  dosage: string;
  frequency: string;
}

interface Interaction {
  severity: 'high' | 'moderate' | 'low';
  description: string;
  recommendation: string;
  drugs: string[];
}

const mockDrugs: string[] = [
  'Aspirin',
  'Ibuprofen',
  'Omeprazole',
  'Metformin'
];

const mockInteractions: Interaction[] = [
  {
    severity: 'high',
    description: 'Increased risk of bleeding',
    recommendation: 'Monitor closely for signs of bleeding. Consider alternative medication.',
    drugs: ['Ibuprofen', 'Aspirin']
  },
  {
    severity: 'moderate',
    description: 'May reduce effectiveness',
    recommendation: 'Space doses at least 2 hours apart.',
    drugs: ['Omeprazole', 'Metformin']
  }
];

const PharmacistInteractions = () => {
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [newDrug, setNewDrug] = useState('');
  const [availableDrugs, setAvailableDrugs] = useState<string[]>(mockDrugs);

  useEffect(() => {
    // Fetch drugs from backend
    const fetchDrugs = async () => {
      try {
        const response = await fetch('/api/drugs');
        const data = await response.json();
        setAvailableDrugs(data);
      } catch (error) {
        console.error('Error fetching drugs:', error);
        // Fallback to mock data if API fails
        setAvailableDrugs(mockDrugs);
      }
    };

    fetchDrugs();
  }, []);

  const handleAddDrug = () => {
    if (!newDrug) return;

    const drug: Drug = {
      name: newDrug,
      dosage: '',
      frequency: ''
    };

    setSelectedDrugs(prev => [...prev, drug]);
    setNewDrug('');

    // Simulate checking for interactions
    const relevantInteractions = mockInteractions.filter(interaction =>
      interaction.drugs.some(d => d.toLowerCase() === newDrug.toLowerCase())
    );

    if (relevantInteractions.length > 0) {
      setInteractions(prev => [...prev, ...relevantInteractions]);
      toast.warning('Potential interactions detected', {
        description: 'Please review the interactions below.',
      });
    }
  };

  const handleRemoveDrug = (index: number) => {
    setSelectedDrugs(prev => prev.filter((_, i) => i !== index));
    // Reset interactions when drugs are removed
    setInteractions([]);
  };

  const filteredDrugs = availableDrugs.filter(drug =>
    drug.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedDrugs.some(selected => selected.name.toLowerCase() === drug.toLowerCase())
  );

  const getSeverityColor = (severity: Interaction['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drug Interactions</h1>
          <p className="text-gray-500 mt-1">Check for potential drug interactions and contraindications</p>
        </div>
      </div>

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
      </div>
    </div>
  );
};

export default PharmacistInteractions; 