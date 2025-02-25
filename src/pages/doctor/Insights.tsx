import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const mockDiseaseData = [
  { name: 'Respiratory', cases: 120 },
  { name: 'Cardiovascular', cases: 98 },
  { name: 'Digestive', cases: 86 },
  { name: 'Neurological', cases: 65 },
  { name: 'Musculoskeletal', cases: 45 },
];

const mockTrendData = [
  { month: 'Jan', cases: 65 },
  { month: 'Feb', cases: 75 },
  { month: 'Mar', cases: 85 },
  { month: 'Apr', cases: 70 },
  { month: 'May', cases: 90 },
  { month: 'Jun', cases: 95 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DiseaseInsights = () => {
  return (
    <div className="fade-in p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Disease Insights</h1>
        <p className="text-gray-500 mt-1">Analytics and trends of diagnosed conditions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Disease Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockDiseaseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cases"
                  >
                    {mockDiseaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cases" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-sm md:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Key Insights</h2>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Download Report
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Most Common Condition</h3>
                <p className="text-blue-700">Respiratory Issues</p>
                <p className="text-sm text-blue-600 mt-1">120 cases this month</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Trending Condition</h3>
                <p className="text-green-700">Cardiovascular</p>
                <p className="text-sm text-green-600 mt-1">+15% from last month</p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">Average Recovery Time</h3>
                <p className="text-yellow-700">12 Days</p>
                <p className="text-sm text-yellow-600 mt-1">Improved by 2 days</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Recommendations</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  • Focus on preventive measures for respiratory conditions
                </li>
                <li className="flex items-center gap-2">
                  • Monitor increasing cardiovascular cases
                </li>
                <li className="flex items-center gap-2">
                  • Continue current treatment protocols showing improved recovery times
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DiseaseInsights; 