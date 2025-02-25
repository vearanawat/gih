import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { Layout, LayoutContent } from '@/components/ui/layout';
import { LogOut } from 'lucide-react';

const PharmacistLayout = () => {
  const location = useLocation();
  const [userName, setUserName] = useState('Pharmacist');

  return (
    <Layout>
      {/* Main Content */}
      <LayoutContent className="flex-1 overflow-auto p-6">
        <Outlet />
      </LayoutContent>
    </Layout>
  );
};

export default PharmacistLayout;