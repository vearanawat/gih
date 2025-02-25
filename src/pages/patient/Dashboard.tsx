import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Pill,
  FileText,
  Activity,
  AlertCircle,
  Video,
  MessageSquare
} from 'lucide-react';

const PatientDashboard = () => {
  return (
    <div className="fade-in space-y-6 p-4">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back, John</h1>
        <p className="text-gray-500 mt-1">Here's your health overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Upcoming Appointment', icon: Calendar, value: 'Mar 25, 2:30 PM', color: 'text-blue-600' },
          { title: 'Next Medication', icon: Pill, value: 'Amoxicillin - 2 PM', color: 'text-green-600' },
          { title: 'Recent Reports', icon: FileText, value: '2 New Results', color: 'text-purple-600' },
          { title: 'Active Prescriptions', icon: Activity, value: '3 Active', color: 'text-orange-600' },
        ].map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="mt-1 text-lg font-semibold">{stat.value}</p>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {[
              { doctor: 'Dr. Sarah Wilson', type: 'Regular Checkup', date: 'Mar 25, 2:30 PM', isUrgent: false },
              { doctor: 'Dr. Michael Chen', type: 'Follow-up', date: 'Mar 28, 10:00 AM', isUrgent: true },
            ].map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{appointment.doctor}</p>
                  <p className="text-sm text-gray-500">{appointment.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{appointment.date}</p>
                  {appointment.isUrgent && (
                    <span className="inline-flex items-center text-xs text-red-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Urgent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Prescriptions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Prescriptions</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {[
              { medicine: 'Amoxicillin', dosage: '500mg', schedule: 'Every 8 hours', remaining: 12 },
              { medicine: 'Ibuprofen', dosage: '400mg', schedule: 'As needed', remaining: 8 },
            ].map((prescription, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{prescription.medicine}</p>
                  <p className="text-sm text-gray-500">{prescription.dosage} - {prescription.schedule}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{prescription.remaining} pills left</p>
                  <Button variant="link" size="sm" className="text-green-600 p-0">
                    Request Refill
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Book Appointment', icon: Calendar, color: 'bg-blue-100 text-blue-600' },
              { title: 'Video Consultation', icon: Video, color: 'bg-purple-100 text-purple-600' },
              { title: 'Chat with Doctor', icon: MessageSquare, color: 'bg-green-100 text-green-600' },
              { title: 'View Reports', icon: FileText, color: 'bg-orange-100 text-orange-600' },
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{action.title}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Health Reminders */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            {[
              { time: '08:00 AM', task: 'Take Amoxicillin', type: 'medication' },
              { time: '02:30 PM', task: 'Doctor Appointment', type: 'appointment' },
              { time: '04:00 PM', task: 'Take Blood Pressure', type: 'checkup' },
            ].map((reminder, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">{reminder.time}</p>
                  <p className="text-sm text-gray-500">{reminder.task}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard; 