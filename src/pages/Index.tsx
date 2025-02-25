
import React from 'react';
import { Card } from "@/components/ui/card";
import {
  Activity,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardCard = ({
  icon: Icon,
  title,
  value,
  change,
  link
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
  link: string;
}) => (
  <Link to={link}>
    <Card className="p-6 hover-scale glass-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-2">{value}</h3>
          <p className="text-sm text-health-600 mt-2">{change}</p>
        </div>
        <Icon className="w-8 h-8 text-health-600" />
      </div>
    </Card>
  </Link>
);

const Index = () => {
  const stats = [
    {
      icon: FileText,
      title: "Prescriptions Today",
      value: "24",
      change: "+12% from yesterday",
      link: "/prescriptions"
    },
    {
      icon: Activity,
      title: "Diagnoses Today",
      value: "18",
      change: "+5% from yesterday",
      link: "/diagnostics"
    },
    {
      icon: User,
      title: "Active Patients",
      value: "156",
      change: "+3 new today",
      link: "/history"
    },
    {
      icon: Calendar,
      title: "Pending Reviews",
      value: "8",
      change: "2 urgent",
      link: "/prescriptions"
    }
  ];

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Overview of today's activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <DashboardCard key={index} {...stat} />
        ))}
      </div>

      <div className="mt-12 glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {/* Placeholder for recent activity */}
          <p className="text-gray-500">No recent activity to display</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
