'use client';

import React from 'react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  isServiceCenter: boolean;
  isActivated: boolean;
  firebaseUid: string;
}

interface WelcomeCardProps {
  userProfile: UserProfile;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userProfile }) => {
  const currentTime = new Date().getHours();
  let greeting = 'Buenas noches';
  
  if (currentTime < 12) {
    greeting = 'Buenos días';
  } else if (currentTime < 18) {
    greeting = 'Buenas tardes';
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {greeting}, {userProfile.username}
          </h1>
          <p className="text-indigo-100 text-lg">
            ¡Bienvenido de vuelta a Megalabs!
          </p>
          {userProfile.isServiceCenter && (
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white">
                🏢 Centro de Servicio
              </span>
            </div>
          )}
        </div>
        
        <div className="hidden sm:block">
          <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {userProfile.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📚</div>
            <div>
              <p className="text-sm text-indigo-100">Capacitaciones</p>
              <p className="text-lg font-semibold">Disponibles</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📄</div>
            <div>
              <p className="text-sm text-indigo-100">Productos</p>
              <p className="text-lg font-semibold">Catálogo</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">💬</div>
            <div>
              <p className="text-sm text-indigo-100">Soporte</p>
              <p className="text-lg font-semibold">24/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;