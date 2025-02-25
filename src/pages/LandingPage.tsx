import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Shield, 
  Clock, 
  Users,
  ArrowRight,
  Stethoscope,
  Pill,
  Bot
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: 'Patient-Centric Care',
      description: 'Access your medical records, prescriptions, and test results anytime, anywhere.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is protected with state-of-the-art encryption and security measures.'
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Round-the-clock access to your health information and AI-powered assistance.'
    },
    {
      icon: Users,
      title: 'Connected Healthcare',
      description: 'Seamless communication between patients, doctors, and pharmacists.'
    }
  ];

  const roles = [
    {
      icon: Heart,
      title: 'Patients',
      description: 'Access your medical records, manage appointments, and track prescriptions.',
      path: '/patient-dashboard'
    },
    {
      icon: Stethoscope,
      title: 'Doctors',
      description: 'Manage patient care, analyze medical images, and get AI-powered insights.',
      path: '/doctor-dashboard'
    },
    {
      icon: Pill,
      title: 'Pharmacists',
      description: 'Process prescriptions, check drug interactions, and manage inventory.',
      path: '/pharmacist-dashboard'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-green-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Your Health, Simplified
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A modern healthcare platform connecting patients, doctors, and pharmacists with AI-powered assistance.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Button
                  onClick={() => navigate('/signup')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
                >
                  {/* Get Started */}
                  GO TO THE DASHBOARD
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/signin')}
                  className="px-8 py-6 text-lg"
                >
                  Sign In
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="10292830.jpg " 
                alt="Healthcare Illustration" 
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose MediFlow?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Solutions for Everyone
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(role.path)}
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <role.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                <p className="text-gray-600 mb-4">{role.description}</p>
                <Button
                  variant="ghost"
                  className="text-green-600 hover:text-green-700 p-0 flex items-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6">
                AI-Powered Health Assistant
              </h2>
              <p className="text-gray-600 mb-8">
                Get instant answers to your health questions, analyze symptoms, and receive personalized health insights powered by advanced artificial intelligence.
              </p>
              <Button
                onClick={() => navigate('/patient-dashboard/assistant')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Try AI Assistant
                <Bot className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 bg-green-50 p-8 rounded-2xl">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="w-6 h-6 text-green-600" />
                  <p className="font-medium">AI Health Assistant</p>
                </div>
                <p className="text-gray-600 mb-3">
                  "Hello! I can help you understand your symptoms, provide medication information, and answer your health-related questions. How can I assist you today?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">
              © 2024 MediFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

