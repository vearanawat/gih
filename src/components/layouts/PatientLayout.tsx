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

const navigation: NavGroup[] = [
  {
    name: 'Overview',
    icon: Home,
    items: [
      { name: 'Dashboard', href: '/patient-dashboard', icon: Home },
    ],
    expanded: true
  },
  {
    name: 'Prescriptions & Orders',
    icon: FileText,
    items: [
      { name: 'Active Prescriptions', href: '/patient-dashboard/prescriptions', icon: Pill, badge: 2 },
      { name: 'Order History', href: '/patient-dashboard/orders', icon: FileText },
    ]
  },
  {
    name: 'Medical Records',
    icon: History,
    items: [
      { name: 'Test Results', href: '/patient-dashboard/diagnostics', icon: AlertCircle },
      { name: 'Medical History', href: '/patient-dashboard/history', icon: History },
    ]
  },
  {
    name: 'Telemedicine',
    icon: Video,
    items: [
      { name: 'Video Consultation', href: '/patient-dashboard/video', icon: Video },
      { name: 'Book Appointment', href: '/patient-dashboard/appointments', icon: Calendar },
      { name: 'Chat with Doctor', href: '/patient-dashboard/chat', icon: MessageSquare },
    ]
  },
  {
    name: 'AI Assistant',
    icon: Bot,
    items: [
      { name: 'Health Assistant', href: '/patient-dashboard/assistant', icon: Bot },
      { name: 'Symptom Checker', href: '/patient-dashboard/symptoms', icon: AlertCircle },
      { name: 'Medicine Info', href: '/patient-dashboard/medicine-info', icon: Pill },
      { name: 'Voice Commands', href: '/patient-dashboard/voice', icon: MessageCircle },
    ]
  },
];

const PatientLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Overview']);
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
    <Layout>
      {/* Sidebar */}
      <LayoutSidebar
        collapsed={collapsed}
        className="border-r bg-white"
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-14 items-center border-b px-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto rounded-lg p-2 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2">
            {navigation.map((group) => (
              <div key={group.name} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className={`
                    flex w-full items-center justify-between rounded-lg px-3 py-2
                    text-gray-500 transition-colors hover:text-gray-900
                    ${expandedGroups.includes(group.name) ? 'bg-gray-100 text-gray-900' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <group.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{group.name}</span>
                  </div>
                  {expandedGroups.includes(group.name) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {expandedGroups.includes(group.name) && (
                  <div className="ml-4 space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`
                          flex items-center justify-between rounded-lg px-3 py-2
                          text-sm text-gray-500 transition-colors hover:text-gray-900
                          ${isActiveRoute(item.href) ? 'bg-gray-100 text-gray-900 font-medium' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Menu */}
          <div className="border-t p-4">
            <Link
              to="/patient-dashboard/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-colors hover:text-gray-900"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </LayoutSidebar>

      {/* Main Content */}
      <LayoutContent className="flex-1 overflow-auto">
        <Outlet />
      </LayoutContent>
    </Layout>
  );
};

export default PatientLayout;