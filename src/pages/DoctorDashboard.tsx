import React from 'react';
import { Card } from "@/components/ui/card";
import {
  Activity,
  Calendar,
  Clock,
  Users,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DoctorDashboard: React.FC = () => {
  const stats = [
    {
      icon: Users,
      title: "Total Patients",
      value: "124",
      change: "+4 new today"
    },
    {
      icon: Calendar,
      title: "Appointments Today",
      value: "8",
      change: "2 pending"
    },
    {
      icon: Activity,
      title: "Active Prescriptions",
      value: "45",
      change: "12 need renewal"
    },
    {
      icon: Clock,
      title: "Average Wait Time",
      value: "14min",
      change: "-2min from last week"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back, Dr. Smith</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change}</p>
              </div>
              <stat.icon className="w-6 h-6 text-green-600" />
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Patient Name {index + 1}</p>
                    <p className="text-sm text-gray-500">General Checkup</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-500">09:00 AM</p>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Prescription updated for Patient {index + 1}</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DoctorDashboard;