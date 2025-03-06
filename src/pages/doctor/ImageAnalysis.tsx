import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Loader2, 
  Activity
} from 'lucide-react';
import { toast } from "sonner";
import axios from 'axios';

interface Prediction {
  prediction: string;
  top_predictions: Array<{
    prediction: string;
    rank: number;
  }>;
}

const ImageAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageType, setImageType] = useState<'xray' | 'ct'>('xray');
  const [imageResult, setImageResult] = useState<Prediction | null>(null);
  const [modelsInitialized, setModelsInitialized] = useState(false);

  useEffect(() => {
    initializeModels();
  }, []);

  const initializeModels = async () => {
    try {
      const response = await axios.post('http://localhost:8000/medical/init-models');
      if (response.data.status === 'success') {
        setModelsInitialized(true);
        toast.success('Medical imaging models initialized');
      }
    } catch (error) {
      console.error('Error initializing models:', error);
      toast.error('Failed to initialize models');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleImageAnalysis(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      handleImageAnalysis(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleImageAnalysis = async (file: File) => {
    if (!modelsInitialized) {
      toast.error('Models not initialized');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = imageType === 'xray' ? 'http://localhost:8000/medical/predict-xray' : 'http://localhost:8000/medical/predict-ct';
      const response = await axios.post(endpoint, formData);

      setImageResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medical Image Analysis</h1>
        <p className="text-gray-500 mt-1">Upload and analyze medical images for diagnosis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upload Medical Image</h2>
            <div className="flex gap-2">
              <Button
                variant={imageType === 'xray' ? 'default' : 'outline'}
                onClick={() => setImageType('xray')}
              >
                X-Ray
              </Button>
              <Button
                variant={imageType === 'ct' ? 'default' : 'outline'}
                onClick={() => setImageType('ct')}
              >
                CT Scan
              </Button>
            </div>
          </div>
          <div 
            className="rounded-lg border-2 border-dashed border-gray-200 p-8 hover:border-green-300 transition-colors text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
              {loading ? (
                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-green-600" />
              )}
            </div>
            <h3 className="text-base font-semibold mb-1">Upload Medical Image</h3>
            <p className="text-sm text-gray-500 mb-4">
              {loading
                ? 'Analyzing image...'
                : `Drag and drop your ${imageType.toUpperCase()} image here, or click below`}
            </p>
            <input
              type="file"
              id="image-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={loading}
            />
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Select Image'
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Analysis Results</h2>
            {imageResult && (
              <Button variant="outline" size="sm">View Full Report</Button>
            )}
          </div>
          {selectedFile && (
            <div className="mb-4">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected"
                className="max-h-48 mx-auto rounded-lg"
              />
            </div>
          )}
          {imageResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Primary Diagnosis</h3>
                <p className="text-gray-700 mt-1">{imageResult.prediction}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Alternative Diagnoses</h3>
                <ul className="mt-2 space-y-2">
                  {imageResult.top_predictions.map((pred) => (
                    <li key={pred.rank} className="text-gray-700">
                      {pred.rank}. {pred.prediction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center p-8">
              Upload a medical image to see analysis results
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ImageAnalysis;