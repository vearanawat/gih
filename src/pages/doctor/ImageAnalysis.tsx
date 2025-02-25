import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { analyzeDiagnosticImage } from '@/utils/ml';

const ImageAnalysis = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleAnalysis(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      handleAnalysis(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleAnalysis = async (file: File) => {
    try {
      setAnalyzing(true);
      
      toast('Starting image analysis...', {
        description: 'This may take a few moments.',
      });

      const result = await analyzeDiagnosticImage(file);
      setAnalysisResult(result);
      
      toast.success('Analysis complete!', {
        description: 'Medical image has been processed successfully.',
      });

    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Analysis failed', {
        description: 'There was an error analyzing the image. Please try again.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fade-in p-4 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medical Image Analysis</h1>
        <p className="text-gray-500 mt-1">Upload and analyze medical images for diagnosis</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white shadow-sm">
          <div className="p-6">
            <div 
              className="rounded-lg border-2 border-dashed border-gray-200 p-8 hover:border-green-300 transition-colors text-center"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                {analyzing ? (
                  <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-green-600" />
                )}
              </div>
              <h3 className="text-base font-semibold mb-1">Upload Medical Image</h3>
              <p className="text-sm text-gray-500 mb-4 mx-auto max-w-md">
                {analyzing 
                  ? 'Analyzing image...' 
                  : 'Drag and drop your medical image here, or click the button below'}
              </p>
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={analyzing}
              />
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={analyzing}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {analyzing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Select Image'
                )}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h2>
            {selectedFile && (
              <div className="mb-4">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected"
                  className="max-h-48 mx-auto rounded-lg"
                />
              </div>
            )}
            {analysisResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">Diagnosis</h3>
                  <p className="text-gray-700 mt-1">{analysisResult.diagnosis}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">Confidence</h3>
                  <p className="text-gray-700 mt-1">{(analysisResult.confidence * 100).toFixed(2)}%</p>
                </div>
                {analysisResult.details && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">Additional Details</h3>
                    <pre className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {JSON.stringify(analysisResult.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                Upload a medical image to see analysis results
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImageAnalysis; 