import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SideNav from '@/components/SideNav';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

const DashboardLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return null; 
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SideNav userRole={user.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;