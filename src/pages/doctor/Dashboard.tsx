import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Upload,
  FileText,
  Users,
  Activity,
  Calendar
} from 'lucide-react';

const DoctorDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Upload className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-semibold">Upload Images</h3>
              <p className="text-sm text-gray-500">Process medical images</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="font-semibold">Diagnoses</h3>
              <p className="text-sm text-gray-500">View patient diagnoses</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <h3 className="font-semibold">Patients</h3>
              <p className="text-sm text-gray-500">Manage patient records</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-8 h-8 text-orange-500" />
            <div>
              <h3 className="font-semibold">Appointments</h3>
              <p className="text-sm text-gray-500">Schedule management</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add more sections as needed */}
    </div>
  );
};

export default DoctorDashboard; 