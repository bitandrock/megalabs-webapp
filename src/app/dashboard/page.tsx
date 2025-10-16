'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import WelcomeCard from '@/components/WelcomeCard';
import QuickActions from '@/components/QuickActions';
import RecentActivity from '@/components/RecentActivity';

const DashboardPage = () => {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome section */}
            <WelcomeCard userProfile={userProfile} />

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick actions */}
              <div className="lg:col-span-2">
                <QuickActions userProfile={userProfile} />
              </div>

              {/* Recent activity */}
              <div className="lg:col-span-1">
                <RecentActivity userId={userProfile.id} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;