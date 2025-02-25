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
  MessageSquare
} from 'lucide-react';
import { Button } from '../ui/button';

const navigation = [
  {
    name: 'Image Upload & Analysis',
    href: '/diagnostic-dashboard',
    icon: Upload,
    description: 'Upload and analyze medical images'
  },
  {
    name: 'Symptom Analysis',
    href: '/diagnostic-dashboard/symptoms',
    icon: Stethoscope,
    description: 'Input symptoms and get diagnosis'
  },
  {
    name: 'Patient History',
    href: '/diagnostic-dashboard/history',
    icon: FileText,
    description: 'View patient history and reports'
  },
  {
    name: 'Disease Insights',
    href: '/diagnostic-dashboard/insights',
    icon: TrendingUp,
    description: 'Track disease progression'
  },
  {
    name: 'Second Opinion',
    href: '/diagnostic-dashboard/second-opinion',
    icon: MessageSquare,
    description: 'Request expert second opinions'
  }
];

const DoctorLayout = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
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
        <LayoutSidebar className={`border-r bg-white transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="rounded-full"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </Button>
            </div>
            <nav className="space-y-1 p-2 flex-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActiveRoute(item.href)
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </LayoutSidebar>

        <LayoutContent className="flex-1 overflow-auto p-6">
          <Outlet />
        </LayoutContent>
      </div>
    </Layout>
  );
};

export default DoctorLayout;