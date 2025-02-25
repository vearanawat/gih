import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Pill ,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        }
      }
    };
    // fetchUserData();
  }, []);

  const stats = [
    {
      icon: Calendar,
      title: "Next Appointment",
      value: "Mar 15",
      change: "In 3 days"
    },
    {
      icon: Pill,
      title: "Active Medications",
      value: "3",
      change: "1 renewal needed"
    },
    {
      icon: FileText,
      title: "Recent Reports",
      value: "2",
      change: "Updated yesterday"
    },
    {
      icon: Clock,
      title: "Last Checkup",
      value: "Feb 28",
      change: "15 days ago"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back, {userData?.firstName || 'John'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
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
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {[1, 2].map((_, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Dr. Smith</p>
                    <p className="text-sm text-gray-500">General Checkup</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-sm text-gray-500">Mar 15, 09:00 AM</p>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Current Medications */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Medications</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-medium">Medication {index + 1}</p>
                  <p className="text-sm text-gray-500">1 pill, twice daily</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Next dose: 2:00 PM
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientDashboard;