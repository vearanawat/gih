import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { API_BASE_URL } from '../config';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const ImagePreview = styled('img')`
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  margin-top: 16px;
`;

interface DiagnosticResult {
  diagnosis: string;
  confidence: number;
  details: {
    raw_score: number;
    threshold: number;
  };
}

const Diagnostics: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [formData, setFormData] = useState({
    age: '',
    blood_pressure: '',
    cholesterol: '',
    glucose: '',
    symptom_fever: '0',
    symptom_cough: '0',
    symptom_fatigue: '0',
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSymptomChange = (event: any) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedImage);
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await fetch(`${API_BASE_URL}/analyze-diagnostic/`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze diagnostic image');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Medical Diagnostics
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Patient Information
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Blood Pressure"
                      name="blood_pressure"
                      type="number"
                      value={formData.blood_pressure}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Cholesterol"
                      name="cholesterol"
                      type="number"
                      value={formData.cholesterol}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Glucose"
                      name="glucose"
                      type="number"
                      value={formData.glucose}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Symptoms
                    </Typography>
                  </Grid>
                  
                  {['fever', 'cough', 'fatigue'].map((symptom) => (
                    <Grid item xs={12} sm={4} key={symptom}>
                      <FormControl fullWidth>
                        <InputLabel>{symptom.charAt(0).toUpperCase() + symptom.slice(1)}</InputLabel>
                        <Select
                          name={`symptom_${symptom}`}
                          value={formData[`symptom_${symptom}` as keyof typeof formData]}
                          onChange={handleSymptomChange}
                          label={symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                        >
                          <MenuItem value="0">No</MenuItem>
                          <MenuItem value="1">Yes</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  ))}

                  <Grid item xs={12}>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                    >
                      Upload Medical Image
                      <VisuallyHiddenInput
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </Button>
                  </Grid>

                  {imagePreview && (
                    <Grid item xs={12}>
                      <Paper elevation={2} sx={{ p: 2 }}>
                        <ImagePreview src={imagePreview} alt="Preview" />
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading || !selectedImage}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Analyze'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Diagnostic Results
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {result && (
                <Box>
                  <Alert
                    severity={result.diagnosis === 'Normal' ? 'success' : 'warning'}
                    sx={{ mb: 2 }}
                  >
                    {result.diagnosis}
                  </Alert>
                  
                  <Typography variant="body1" gutterBottom>
                    Confidence: {result.confidence.toFixed(2)}%
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Raw Score: {result.details.raw_score.toFixed(4)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Threshold: {result.details.threshold}
                  </Typography>
                </Box>
              )}

              {!error && !result && (
                <Typography color="text.secondary">
                  Upload an image and fill in the patient information to get a diagnostic analysis.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Diagnostics; 