import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, FileText } from 'lucide-react';
import { toast } from "sonner";
import { getSecondOpinion } from '@/utils/ml';

interface CaseDetails {
  patientAge: string;
  patientGender: string;
  symptoms: string;
  currentDiagnosis: string;
  medicalHistory: string;
  testResults: string;
}

const SecondOpinion = () => {
  const [loading, setLoading] = useState(false);
  const [caseDetails, setCaseDetails] = useState<CaseDetails>({
    patientAge: '',
    patientGender: '',
    symptoms: '',
    currentDiagnosis: '',
    medicalHistory: '',
    testResults: ''
  });
  const [secondOpinion, setSecondOpinion] = useState<any>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleInputChange = (field: keyof CaseDetails, value: string) => {
    setCaseDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields: (keyof CaseDetails)[] = ['symptoms', 'currentDiagnosis'];
    const missingFields = requiredFields.filter(field => !caseDetails[field]);
    
    if (missingFields.length > 0) {
      toast.error('Missing required information', {
        description: `Please provide: ${missingFields.join(', ')}`,
      });
      return;
    }

    try {
      setLoading(true);
      toast('Analyzing case details...', {
        description: 'This may take a few moments.',
      });

      const result = await getSecondOpinion(caseDetails, attachments);
      setSecondOpinion(result);
      
      toast.success('Analysis complete!', {
        description: 'Second opinion has been generated.',
      });
    } catch (error) {
      console.error('Error getting second opinion:', error);
      toast.error('Analysis failed', {
        description: 'There was an error analyzing the case. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Get Second Opinion</h1>
        <p className="text-gray-500 mt-1">AI-assisted analysis for diagnostic confirmation</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Age
                  </label>
                  <Input
                    type="text"
                    value={caseDetails.patientAge}
                    onChange={(e) => handleInputChange('patientAge', e.target.value)}
                    placeholder="e.g., 45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Gender
                  </label>
                  <Input
                    type="text"
                    value={caseDetails.patientGender}
                    onChange={(e) => handleInputChange('patientGender', e.target.value)}
                    placeholder="e.g., Male"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms *
                </label>
                <Textarea
                  value={caseDetails.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  placeholder="Describe the patient's symptoms..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Diagnosis *
                </label>
                <Textarea
                  value={caseDetails.currentDiagnosis}
                  onChange={(e) => handleInputChange('currentDiagnosis', e.target.value)}
                  placeholder="Enter your current diagnosis..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical History
                </label>
                <Textarea
                  value={caseDetails.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  placeholder="Relevant medical history..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Results
                </label>
                <Textarea
                  value={caseDetails.testResults}
                  onChange={(e) => handleInputChange('testResults', e.target.value)}
                  placeholder="Any test results or lab work..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Get Second Opinion'
                )}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h2>
            {secondOpinion ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Diagnostic Assessment</h3>
                  <p className="text-gray-700">{secondOpinion.assessment}</p>
                </div>

                {secondOpinion.alternativeDiagnoses && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Alternative Diagnoses</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {secondOpinion.alternativeDiagnoses.map((diagnosis: string, index: number) => (
                        <li key={index}>{diagnosis}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {secondOpinion.recommendations && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {secondOpinion.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Confidence Level</h3>
                  <p className="text-gray-700">
                    {(secondOpinion.confidence * 100).toFixed(1)}% confidence in assessment
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Enter case details and submit to receive AI-assisted analysis
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SecondOpinion; 