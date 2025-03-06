import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Upload,
  FileText,
  Users,
  Activity,
  Calendar,
  Clock,
  Pill,
  MessageSquare,
  Video,
  AlertCircle,
  LayoutDashboard,
  History,
  Settings,
  Bell,
  Stethoscope,
  Brain,
  FileSearch,
  ChevronLeft
} from 'lucide-react';

const DoctorDashboard = () => {
  // Sidebar navigation items
  const sidebarItems = [
    { name: 'Image Analysis', href: '/doctor-dashboard', icon: Upload, active: true },
    { name: 'Symptom Analysis', href: '/doctor-dashboard/symptoms', icon: Stethoscope },
    { name: 'Diagnostics', href: '/doctor-dashboard/diagnostics', icon: LayoutDashboard },
    { name: 'History', href: '/doctor-dashboard/history', icon: History },
    { name: 'Disease Insights', href: '/doctor-dashboard/insights', icon: Brain },
    { name: 'Second Opinion', href: '/doctor-dashboard/second-opinion', icon: FileSearch },
    // { name: 'Community Forum', href: '/doctor-dashboard/community', icon: Users },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r bg-white flex-shrink-0">
        <div className="p-4 border-b">
          <Link to="/" className="text-2xl font-bold text-green-600 whitespace-nowrap">
            MediFlow
          </Link>
          <div className="text-sm text-gray-500">Welcome, Dr. Doctor</div>
        </div>
        <nav className="p-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                item.active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Medical Image Analysis</h1>
          <p className="text-gray-600 mb-8">Upload and analyze medical images for diagnosis</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="p-6 border border-dashed">
              <div className="flex flex-col items-center justify-center h-80">
                <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Upload Medical Image</h2>
                <p className="text-center text-gray-500 mb-4">
                  Drag and drop your medical image here, or click the button below
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  Select Image
                </Button>
              </div>
            </Card>

            {/* Results Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              <div className="flex items-center justify-center h-72 text-gray-500 border border-dashed rounded-lg">
                <p>Upload a medical image to see analysis results</p>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Analyses</p>
                  <p className="mt-1 text-lg font-semibold">128</p>
                </div>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Recent Reports</p>
                  <p className="mt-1 text-lg font-semibold">12 New</p>
                </div>
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Success Rate</p>
                  <p className="mt-1 text-lg font-semibold">96%</p>
                </div>
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;