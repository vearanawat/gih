import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import {
  Layout,
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
  LayoutDashboard,
  Menu,
  Bell,
  Settings,
  UserRound
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
    if (path === '/doctor-dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-40 h-screen w-64 
        transition-transform border-r bg-white
        ${collapsed ? '-translate-x-full' : 'translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/doctor-dashboard" className="text-xl font-semibold text-green-600">
            MediFlow
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 transition-margin
        ${collapsed ? 'ml-0' : 'ml-64'}
      `}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b bg-white">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="rounded-full p-2 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <button className="rounded-full p-2 hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 p-2">
                  <UserRound className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Dr. {userName}</span>
                <button
                  onClick={() => auth.signOut()}
                  className="text-gray-600 hover:text-red-600 transition-colors ml-2"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DoctorLayout;