import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layout
import MainLayout from '@/components/layouts/MainLayout';
import DoctorLayout from '@/components/layouts/DoctorLayout';

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
import ChatPage from '@/pages/patient/Chat';
import AppointmentsPage from '@/pages/patient/Appointments';
import VideoPage from '@/pages/patient/Video';

// Doctor Pages
import ImageAnalysis from '@/pages/doctor/ImageAnalysis';
import SymptomAnalysis from '@/pages/doctor/SymptomAnalysis';
import DoctorHistory from '@/pages/doctor/History';
import DiseaseInsights from '@/pages/doctor/Insights';
import SecondOpinion from '@/pages/doctor/SecondOpinion';
import Diagnostics from '@/pages/doctor/Diagnostics';

// Pharmacist Pages
import PharmacistDashboard from '@/pages/pharmacist/Dashboard';
import PharmacistOrders from '@/pages/pharmacist/Orders';
import PharmacistInteractions from '@/pages/pharmacist/Interactions';
import PharmacistHistory from '@/pages/pharmacist/History';
import PharmacistNotes from '@/pages/pharmacist/Notes';
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";

// Components
import ProtectedRoute from '@/components/ProtectedRoute';

// Wrapper components for layouts
const MainLayoutWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

const DoctorLayoutWrapper = () => (
  <DoctorLayout>
    <Outlet />
  </DoctorLayout>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayoutWrapper />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>
        
        {/* Patient routes */}
        <Route element={<MainLayoutWrapper />}>
          <Route path="/patient-dashboard">
            <Route index element={<PatientDashboard />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="diagnostics" element={<PatientDiagnostics />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="history" element={<PatientHistory />} />
            <Route path="settings" element={<PatientSettings />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="video" element={<VideoPage />} />
          </Route>
        </Route>
        
        {/* Doctor routes */}
        <Route element={<DoctorLayoutWrapper />}>
          <Route path="/doctor-dashboard">
            <Route index element={<ImageAnalysis />} />
            <Route path="symptoms" element={<SymptomAnalysis />} />
            <Route path="diagnostics" element={<Diagnostics />} />
            <Route path="history" element={<DoctorHistory />} />
            <Route path="insights" element={<DiseaseInsights />} />
            <Route path="second-opinion" element={<SecondOpinion />} />
          </Route>
        </Route>
        
        {/* Pharmacist routes */}
        <Route element={<MainLayoutWrapper />}>
          <Route path="/pharmacist-dashboard">
            <Route index element={<PharmacistDashboard />} />
            <Route path="orders" element={<PharmacistOrders />} />
            <Route path="interactions" element={<PharmacistInteractions />} />
            <Route path="history" element={<PharmacistHistory />} />
            <Route path="notes" element={<PharmacistNotes />} />
          </Route>
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
};

export default App;
