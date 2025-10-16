'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { userProfile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Page title - can be dynamic based on route */}
          <h1 className="ml-4 text-xl font-semibold text-gray-900 lg:ml-0">
            Dashboard
          </h1>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <BellIcon className="h-6 w-6" />
              {/* Notification badge */}
              <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No hay notificaciones nuevas
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User info */}
          {userProfile && (
            <div className="flex items-center">
              <div className="hidden sm:block mr-3">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile.username}
                </p>
                <p className="text-xs text-gray-500">
                  {userProfile.isServiceCenter ? 'Centro de Servicio' : 'Usuario'}
                </p>
              </div>
              
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-medium text-sm">
                  {userProfile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;