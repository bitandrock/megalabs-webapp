'use client';

import React from 'react';
import Link from 'next/link';
import { 
  AcademicCapIcon, 
  DocumentTextIcon, 
  QuestionMarkCircleIcon, 
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  CogIcon 
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  isServiceCenter: boolean;
  isActivated: boolean;
  firebaseUid: string;
}

interface QuickActionsProps {
  userProfile: UserProfile;
}

const QuickActions: React.FC<QuickActionsProps> = ({ userProfile }) => {
  const actions = [
    {
      title: 'Ver Capacitaciones',
      description: 'Accede a todos los cursos disponibles',
      href: '/trainings',
      icon: AcademicCapIcon,
      color: 'bg-blue-50 text-blue-700',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Catálogo de Productos',
      description: 'Explora nuestros productos y documentación',
      href: '/products',
      icon: DocumentTextIcon,
      color: 'bg-green-50 text-green-700',
      iconColor: 'text-green-500',
    },
    {
      title: 'Preguntas Frecuentes',
      description: 'Encuentra respuestas rápidas',
      href: '/faq',
      icon: QuestionMarkCircleIcon,
      color: 'bg-yellow-50 text-yellow-700',
      iconColor: 'text-yellow-500',
    },
    {
      title: 'Solicitar Soporte',
      description: 'Contacta con nuestro equipo de soporte',
      href: '/support',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-50 text-purple-700',
      iconColor: 'text-purple-500',
    },
  ];

  // Add service center action if user is service center
  if (userProfile.isServiceCenter) {
    actions.push({
      title: 'Centro de Servicio',
      description: 'Panel de administración y gestión',
      href: '/service-center',
      icon: BuildingOfficeIcon,
      color: 'bg-indigo-50 text-indigo-700',
      iconColor: 'text-indigo-500',
    });
  }

  actions.push({
    title: 'Configuración',
    description: 'Personaliza tu perfil y preferencias',
    href: '/settings',
    icon: CogIcon,
    color: 'bg-gray-50 text-gray-700',
    iconColor: 'text-gray-500',
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Acciones Rápidas</h2>
        <p className="text-sm text-gray-500 mt-1">
          Accede a las funcionalidades principales de la plataforma
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 hover:border-gray-300"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-2 rounded-lg ${action.color}`}>
                  <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </div>
              
              {/* Hover arrow */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg 
                  className="h-4 w-4 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5l7 7-7 7" 
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;