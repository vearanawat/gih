import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  User,
  Video,
  Phone,
  AlertCircle,
  X,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'video' | 'in-person' | 'phone';
  status: 'upcoming' | 'completed' | 'cancelled';
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Wilson',
    specialty: 'General Physician',
    date: '2024-03-25',
    time: '14:30',
    type: 'video',
    status: 'upcoming'
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Cardiologist',
    date: '2024-03-28',
    time: '10:00',
    type: 'in-person',
    status: 'upcoming'
  }
];

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const getAppointmentTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'in-person':
        return <User className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'upcoming':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="fade-in p-4 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500 mt-1">Schedule and manage your appointments</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Calendar Section */}
        <Card className="md:col-span-2 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Calendar</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Calendar Grid (Placeholder) */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <button
                key={i}
                className="aspect-square rounded-lg hover:bg-gray-50 relative"
              >
                <span className="text-sm">{i + 1}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowBookingForm(true)}
            >
              Book New Appointment
            </Button>
            <Button variant="outline" className="w-full">
              View All Appointments
            </Button>
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="md:col-span-3 bg-white">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {getAppointmentTypeIcon(appointment.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-500">{appointment.specialty}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{appointment.date}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    {appointment.type === 'video' && (
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Join Call
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Book Appointment</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBookingForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Doctor</label>
                <Input placeholder="Select doctor" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <Input type="time" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                  <Button variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    In-person
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBookingForm(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Book Appointment
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage; 