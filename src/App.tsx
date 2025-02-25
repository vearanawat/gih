import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layouts
import MainLayout from '@/components/layouts/MainLayout';
import PatientLayout from '@/components/layouts/PatientLayout';
import DoctorLayout from '@/components/layouts/DoctorLayout';
import PharmacistLayout from '@/components/layouts/PharmacistLayout';

// Public Pages
import LandingPage from '@/pages/LandingPage';
import SignUpPage from '@/pages/SignUp';
import SignInPage from '@/pages/SignIn';

// Patient Pages
import PatientDashboard from '@/pages/patient/Dashboard';
import PatientPrescriptions from '@/pages/patient/Prescriptions';
import PatientDiagnostics from '@/pages/patient/Diagnostics';
import PatientHistory from '@/pages/patient/History';
import PatientSettings from '@/pages/patient/Settings';
import AIAssistant from '@/pages/patient/AIAssistant';

// Doctor Pages
import ImageAnalysis from '@/pages/doctor/ImageAnalysis';
import SymptomAnalysis from '@/pages/doctor/SymptomAnalysis';
import DoctorHistory from '@/pages/doctor/History';
import DiseaseInsights from '@/pages/doctor/Insights';
import SecondOpinion from '@/pages/doctor/SecondOpinion';

// Pharmacist Pages
import PharmacistDashboard from '@/pages/pharmacist/Dashboard';
import PharmacistOrders from '@/pages/pharmacist/Orders';
import PharmacistInteractions from '@/pages/pharmacist/Interactions';
import PharmacistHistory from '@/pages/pharmacist/History';
import PharmacistNotes from '@/pages/pharmacist/Notes';
import { SignedIn, SignedOut, SignIn, SignInButton, UserButton } from "@clerk/clerk-react";

// Components
import ProtectedRoute from '@/components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* Patient routes */}
          <Route
            path="/patient-dashboard/*"
            element={
              // <ProtectedRoute allowedRoles={['patient']}>
                <PatientLayout />
              // </ProtectedRoute>
            }
          >
            <Route index element={<PatientDashboard />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="diagnostics" element={<PatientDiagnostics />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="history" element={<PatientHistory />} />
            <Route path="settings" element={<PatientSettings />} />
          </Route>
          
          {/* Doctor routes */}
          <Route
            path="/doctor-dashboard/*"
            element={
              // <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorLayout />
              // </ProtectedRoute>
            }
          >
            <Route index element={<ImageAnalysis />} />
            <Route path="symptoms" element={<SymptomAnalysis />} />
            <Route path="history" element={<DoctorHistory />} />
            <Route path="insights" element={<DiseaseInsights />} />
            <Route path="second-opinion" element={<SecondOpinion />} />
          </Route>
          
          {/* Pharmacist routes */}
          <Route
            path="/pharmacist-dashboard/*"
            element={
              // <ProtectedRoute allowedRoles={['pharmacist']}>
                <PharmacistLayout />
              // </ProtectedRoute>
            }
          >
            <Route index element={<PharmacistDashboard />} />
            <Route path="orders" element={<PharmacistOrders />} />
            <Route path="interactions" element={<PharmacistInteractions />} />
            <Route path="history" element={<PharmacistHistory />} />
            <Route path="notes" element={<PharmacistNotes />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;
