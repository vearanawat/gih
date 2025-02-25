import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User,
  Mail,
  Phone,
  Bell,
  Shield,
  Key,
  Globe,
  Clock
} from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const mockProfile: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '1990-05-15',
  bloodType: 'O+',
  allergies: ['Penicillin', 'Peanuts'],
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'Spouse',
    phone: '+1 (555) 987-6543'
  }
};

const PatientSettings = () => {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [notifications, setNotifications] = useState({
    appointments: true,
    prescriptions: true,
    results: true,
    reminders: true
  });

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveChanges = () => {
    // Implement save changes logic
    console.log('Saving changes:', { profile, notifications });
  };

  return (
    <div className="fade-in space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="pl-10"
                  type="email"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="pl-10"
                  type="tel"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Date of Birth</label>
              <Input
                value={profile.dateOfBirth}
                onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                className="mt-1"
                type="date"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Blood Type</label>
              <select
                value={profile.bloodType}
                onChange={(e) => handleProfileChange('bloodType', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                      <p className="text-sm text-gray-500">Receive notifications about {key}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleNotificationToggle(key as keyof typeof notifications)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input
                  value={profile.emergencyContact.name}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    emergencyContact: {
                      ...prev.emergencyContact,
                      name: e.target.value
                    }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Relationship</label>
                <Input
                  value={profile.emergencyContact.relationship}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    emergencyContact: {
                      ...prev.emergencyContact,
                      relationship: e.target.value
                    }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={profile.emergencyContact.phone}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      emergencyContact: {
                        ...prev.emergencyContact,
                        phone: e.target.value
                      }
                    }))}
                    className="pl-10"
                    type="tel"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveChanges}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default PatientSettings;