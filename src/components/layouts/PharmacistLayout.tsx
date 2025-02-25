import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Layout, LayoutContent, LayoutSidebar } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ClipboardList,
  AlertCircle,
  History,
  StickyNote,
  ChevronRight,
  ChevronLeft,
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

  return (
    <Layout>
      {/* Sidebar */}
      <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] border-r bg-white shadow-sm transition-all duration-300 ${collapsed ? 'w-16' : 'w-50'}`}>
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
                        ? 'bg-green-50 text-green-600 font-medium'
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

      {/* Main Content */}
      <main className={`transition-all duration-300 pt-16 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <Outlet />
      </main>
    </Layout>
  );
};

export default PharmacistLayout;