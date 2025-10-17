'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface B4iHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
}

const B4iHeader: React.FC<B4iHeaderProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  showMenuButton = false,
  onMenuClick,
  showNotifications = false,
  notificationCount = 0
}) => {
  const { userProfile } = useAuth();

  return (
    <div className="b4i-header flex items-center justify-between">
      {/* Left section - Back button or Menu */}
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        )}
      </div>

      {/* Center section - Logo/Title */}
      <div className="flex items-center flex-1 justify-center">
        {title ? (
          <h1 className="b4i-title text-white text-center">{title}</h1>
        ) : (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-2">
              <span className="text-blue-700 font-bold text-sm">M</span>
            </div>
            <span className="b4i-title text-white">Megalabs</span>
          </div>
        )}
      </div>

      {/* Right section - User info and notifications */}
      <div className="flex items-center">
        {showNotifications && (
          <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors mr-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        )}

        {userProfile && (
          <div className="flex items-center">
            <div className="text-right mr-2">
              <div className="b4i-caption text-white/90">Bienvenido</div>
              <div className="b4i-body text-white font-medium">{userProfile.username}</div>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userProfile.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default B4iHeader;