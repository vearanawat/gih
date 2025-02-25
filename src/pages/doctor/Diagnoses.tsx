import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { analyzeDiagnosticImage } from '../../utils/ml';

const Diagnostics = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      
      toast('Starting diagnostic analysis...', {
        description: 'This may take a few moments.',
      });

      const result = await analyzeDiagnosticImage(file);
      
      toast.success('Analysis complete!', {
        description: 'Diagnostic image has been processed successfully.',
      });

    } catch (error) {
      console.error('Error analyzing diagnostic image:', error);
      toast.error('Analysis failed', {
        description: 'There was an error analyzing the image. Please try again.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fade-in p-4 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Upload Diagnostic Image</h1>
        <p className="text-gray-500 mt-1">Upload and analyze your medical images</p>
      </div>

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
            <h3 className="text-base font-semibold mb-1">Select or Drop Files</h3>
            <p className="text-sm text-gray-500 mb-4 mx-auto max-w-md">
              {analyzing 
                ? 'Analyzing image...' 
                : 'Drag and drop your diagnostic image here, or click the button below to browse'}
            </p>
            <input
              type="file"
              id="diagnostic-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={analyzing}
            />
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 text-sm font-medium mx-auto"
              disabled={analyzing}
              onClick={() => document.getElementById('diagnostic-upload')?.click()}
            >
              {analyzing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Select File'
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Analysis Results</h2>
        <Card className="p-5 bg-white shadow-sm">
          <p className="text-sm text-gray-500">
            {analyzing 
              ? 'Analyzing image...' 
              : 'Upload a diagnostic image to see analysis results'}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Diagnostics;
