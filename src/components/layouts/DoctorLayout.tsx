import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import {
  Layout,
  LayoutHeader,
  LayoutSidebar,
  LayoutContent,
} from '@/components/ui/layout';
import {
  Upload,
  Stethoscope,
  FileText,
  TrendingUp,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Microscope,
  History,
  Brain,
  FileSearch,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '../ui/button';

const navigation = [
  { name: 'Image Analysis', href: '/doctor-dashboard', icon: Microscope },
  { name: 'Symptom Analysis', href: '/doctor-dashboard/symptoms', icon: Stethoscope },
  { name: 'Diagnostics', href: '/doctor-dashboard/diagnostics', icon: LayoutDashboard },
  { name: 'History', href: '/doctor-dashboard/history', icon: History },
  { name: 'Disease Insights', href: '/doctor-dashboard/insights', icon: Brain },
  { name: 'Second Opinion', href: '/doctor-dashboard/second-opinion', icon: FileSearch },
];

const DoctorLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState('Doctor');

  const isActiveRoute = (path: string) => {
    if (path === '/diagnostic-dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Layout>
      <LayoutHeader className="bg-white border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/diagnostic-dashboard" className="text-2xl font-bold text-green-600">
            MediFlow
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, Dr. {userName}</span>
            <button
              onClick={() => auth.signOut()}
              className="text-gray-600 hover:text-red-600 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </LayoutHeader>

      <div className="flex h-[calc(100vh-4rem)]">
        <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] border-r bg-white shadow-sm transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <nav className="px-3 py-4">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-3 px-3 py-2 mb-1 rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className={`transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="p-3 border-t">
              <Button
                variant="ghost"
                className="w-full justify-center hover:bg-gray-100"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <LayoutContent className="flex-1 overflow-auto p-6">
          <Outlet />
        </LayoutContent>
      </div>
    </Layout>
  );
};

export default DoctorLayout;