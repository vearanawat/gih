import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from "sonner";
import { analyzeSymptoms } from '@/utils/ml';

const SymptomAnalysis = () => {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleAddSymptom = () => {
    if (newSymptom.trim()) {
      setSymptoms([...symptoms, newSymptom.trim()]);
      setNewSymptom('');
    }
  };

  const handleRemoveSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleAnalysis = async () => {
    if (symptoms.length === 0) {
      toast.error('No symptoms added', {
        description: 'Please add at least one symptom to analyze.',
      });
      return;
    }

    try {
      setAnalyzing(true);
      
      toast('Analyzing symptoms...', {
        description: 'This may take a few moments.',
      });

      const result = await analyzeSymptoms(symptoms);
      setAnalysisResult(result);
      
      toast.success('Analysis complete!', {
        description: 'Symptoms have been analyzed successfully.',
      });

    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast.error('Analysis failed', {
        description: 'There was an error analyzing the symptoms. Please try again.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fade-in p-4 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Symptom Analysis</h1>
        <p className="text-gray-500 mt-1">Analyze patient symptoms for potential diagnoses</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Symptoms</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Enter a symptom..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddSymptom();
                    }
                  }}
                />
                <Button
                  onClick={handleAddSymptom}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {symptoms.map((symptom, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="flex-1 text-gray-700">{symptom}</span>
                    <button
                      onClick={() => handleRemoveSymptom(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleAnalysis}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={analyzing || symptoms.length === 0}
              >
                {analyzing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Analyze Symptoms'
                )}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>
            {analysisResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">Potential Diagnoses</h3>
                  <ul className="mt-2 space-y-2">
                    {analysisResult.diagnoses.map((diagnosis: any, index: number) => (
                      <li key={index} className="text-gray-700">
                        <span className="font-medium">{diagnosis.condition}</span>
                        <span className="text-gray-500 ml-2">
                          ({(diagnosis.probability * 100).toFixed(1)}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {analysisResult.recommendations && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">Recommendations</h3>
                    <ul className="mt-2 space-y-1">
                      {analysisResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-gray-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.urgency && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">Urgency Level</h3>
                    <p className="text-gray-700 mt-1">{analysisResult.urgency}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                Add symptoms and analyze to see potential diagnoses
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SymptomAnalysis; 