import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
  History,
  StickyNote,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Menu,
  Bell,
  Settings,
  UserRound
} from 'lucide-react';

const navigation = [
  { name: 'Prescriptions', href: '/pharmacist-dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/pharmacist-dashboard/orders', icon: ClipboardList },
  { name: 'Interactions', href: '/pharmacist-dashboard/interactions', icon: AlertCircle },
  { name: 'History', href: '/pharmacist-dashboard/history', icon: History },
  { name: 'Notes', href: '/pharmacist-dashboard/notes', icon: StickyNote },
];

const PharmacistLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState('Pharmacist');

  const isActiveRoute = (path: string) => {
    if (path === '/pharmacist-dashboard') {
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
          <Link to="/pharmacist-dashboard" className="text-xl font-semibold text-green-600">
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
                    ? 'bg-green-50 text-green-600 font-medium'
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
                <div className="rounded-full bg-green-100 p-2">
                  <UserRound className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium">{userName}</span>
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

export default PharmacistLayout;