import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Layout,
  LayoutSidebar,
  LayoutContent,
} from '@/components/ui/layout';
import {
  Home,
  FileText,
  Bell,
  History,
  Settings,
  LogOut,
  MessageSquare,
  Video,
  Calendar,
  AlertCircle,
  Pill,
  ChevronRight,
  ChevronDown,
  Bot,
  Menu,
  Download,
  RefreshCcw,
  UserRound,
  MessageCircle
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  name: string;
  icon: React.ElementType;
  items: NavItem[];
  expanded?: boolean;
}

type NavigationItem = NavItem | NavGroup;

const isNavGroup = (item: NavigationItem): item is NavGroup => {
  return 'items' in item;
};

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/patient-dashboard', icon: Home },
  { name: 'Prescriptions & Orders', href: '/patient-dashboard/prescriptions', icon: Pill, badge: 2 },
  { name: 'History', href: '/patient-dashboard/history', icon: History },
  { name: 'AI Assistant', href: '/patient-dashboard/assistant', icon: Bot },
  {
    name: 'Telemedicine',
    icon: Video,
    items: [
      { name: 'Video Consultation', href: '/patient-dashboard/video', icon: Video },
      { name: 'Book Appointment', href: '/patient-dashboard/appointments', icon: Calendar },
      { name: 'Chat with Doctor', href: '/patient-dashboard/chat', icon: MessageSquare },
    ]
  },
  { name: 'Settings', href: '/patient-dashboard/settings', icon: Settings },
];

const PatientLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const location = useLocation();

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(name => name !== groupName)
        : [...prev, groupName]
    );
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
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
          <span className="text-xl font-semibold">MediFlow</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navigation.map((item) => (
            <div key={item.name}>
              {!isNavGroup(item) ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {expandedGroups.includes(item.name) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedGroups.includes(item.name) && (
                    <div className="ml-6 space-y-1">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <subItem.icon className="h-5 w-5" />
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
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
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
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

export default PatientLayout;