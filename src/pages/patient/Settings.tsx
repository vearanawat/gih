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
import { Switch } from '@/components/ui/switch';

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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your account preferences</p>
      </div>

      {/* Profile Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <Input
              value={profile.firstName}
              onChange={(e) => handleProfileChange('firstName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <Input
              value={profile.lastName}
              onChange={(e) => handleProfileChange('lastName', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              value={profile.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              type="tel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date of Birth</label>
            <Input
              value={profile.dateOfBirth}
              onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
              type="date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Blood Type</label>
            <select
              value={profile.bloodType}
              onChange={(e) => handleProfileChange('bloodType', e.target.value)}
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
        <Button className="mt-4" onClick={handleSaveChanges}>Save Changes</Button>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Appointments</p>
                <p className="text-sm text-gray-500">Receive notifications about appointments</p>
              </div>
            </div>
            <Switch
              checked={notifications.appointments}
              onCheckedChange={(value) => handleNotificationToggle('appointments')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Prescriptions</p>
                <p className="text-sm text-gray-500">Receive notifications about prescriptions</p>
              </div>
            </div>
            <Switch
              checked={notifications.prescriptions}
              onCheckedChange={(value) => handleNotificationToggle('prescriptions')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">Results</p>
                <p className="text-sm text-gray-500">Receive notifications about test results</p>
              </div>
            </div>
            <Switch
              checked={notifications.results}
              onCheckedChange={(value) => handleNotificationToggle('results')}
            />
          </div>
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
  );
};

export default PatientSettings;