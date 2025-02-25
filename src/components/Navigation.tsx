
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Stethoscope,
  Pill,
  Layout,
  History,
  Settings
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Layout, label: 'Dashboard', path: '/' },
    { icon: Pill, label: 'Prescriptions', path: '/prescriptions' },
    { icon: Stethoscope, label: 'Diagnostics', path: '/diagnostics' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200 p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-health-600">HealthSync Assist</h1>
        <p className="text-sm text-gray-500">Medical Assistant Platform</p>
      </div>
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-health-50 group",
                isActive(item.path) && "bg-health-50 text-health-600"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive(item.path) ? "text-health-600" : "text-gray-500"
              )} />
              <span className={cn(
                "font-medium",
                isActive(item.path) ? "text-health-600" : "text-gray-700"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
