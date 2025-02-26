import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Button } from '@/components/ui/button';
import {
  Sun,
  Moon,
  Bell,
  Menu,
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
  History,
  StickyNote,
  FileText,
  Video,
  MessageSquare,
  Activity,
  Settings,
  ChevronDown
} from 'lucide-react';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  // Check if we're on a public page (landing, signin, signup)
  const isPublicPage = ['/', '/signin', '/signup'].includes(location.pathname);

  // Determine the current dashboard type from the URL
  const isDoctorDashboard = location.pathname.includes('doctor-dashboard');
  const isPatientDashboard = location.pathname.includes('patient-dashboard');
  const isPharmacistDashboard = location.pathname.includes('pharmacist-dashboard');

  // Navigation items based on user type
  const doctorNavItems = [
    { name: 'Image Analysis', href: '/doctor-dashboard', icon: LayoutDashboard },
    { name: 'Symptom Analysis', href: '/doctor-dashboard/symptoms', icon: Activity },
    { name: 'Diagnostics', href: '/doctor-dashboard/diagnostics', icon: FileText },
    { name: 'History', href: '/doctor-dashboard/history', icon: History },
    { name: 'Insights', href: '/doctor-dashboard/insights', icon: AlertCircle },
    { name: 'Second Opinion', href: '/doctor-dashboard/second-opinion', icon: MessageSquare },
  ];

  const patientNavItems = [
    { name: 'Dashboard', href: '/patient-dashboard', icon: LayoutDashboard },
    { name: 'Prescriptions', href: '/patient-dashboard/prescriptions', icon: ClipboardList },
    { name: 'Diagnostics', href: '/patient-dashboard/diagnostics', icon: FileText },
    { name: 'Assistant', href: '/patient-dashboard/assistant', icon: MessageSquare },
    { name: 'History', href: '/patient-dashboard/history', icon: History },
    { name: 'Settings', href: '/patient-dashboard/settings', icon: Settings },
    { name: 'Chat', href: '/patient-dashboard/chat', icon: MessageSquare },
    { name: 'Appointments', href: '/patient-dashboard/appointments', icon: AlertCircle },
    { name: 'Video', href: '/patient-dashboard/video', icon: Video },
  ];

  const pharmacistNavItems = [
    { name: 'Dashboard', href: '/pharmacist-dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/pharmacist-dashboard/orders', icon: ClipboardList },
    { name: 'Interactions', href: '/pharmacist-dashboard/interactions', icon: AlertCircle },
    { name: 'History', href: '/pharmacist-dashboard/history', icon: History },
    { name: 'Notes', href: '/pharmacist-dashboard/notes', icon: StickyNote },
  ];

  // Get current navigation items
  const getCurrentNavItems = () => {
    if (isDoctorDashboard) return doctorNavItems;
    if (isPatientDashboard) return patientNavItems;
    if (isPharmacistDashboard) return pharmacistNavItems;
    return [];
  };

  const currentNavItems = getCurrentNavItems();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left section: Logo and Navigation */}
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-green-600 whitespace-nowrap">
                MediFlow
              </Link>

              {!isPublicPage && (
                <div className="hidden md:flex space-x-1">
                  {currentNavItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-green-50 text-green-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right section: Theme, Notifications, User */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu (Dropdown) */}
              {!isPublicPage && (
                <div className="md:hidden relative group">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Menu className="w-4 h-4" />
                    Menu
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    {currentNavItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <span className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          {item.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="text-gray-600 hover:text-gray-900"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <SignedIn>
                <button className="relative text-gray-600 hover:text-gray-900">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              <SignedOut>
                {isPublicPage && (
                  <>
                    <Link to="/signin">
                      <Button variant="outline">Sign In</Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className={`${isPublicPage ? '' : 'pt-16'} max-w-7xl mx-auto`}>
        {children}
      </div>
    </div>
  );
};

export default MainLayout; 