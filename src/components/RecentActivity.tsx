'use client';

import React from 'react';
import { 
  AcademicCapIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface RecentActivityProps {
  userId?: number | string;
}

const RecentActivity: React.FC<RecentActivityProps> = () => {
  // Mock data - in a real app, this would come from an API
  const activities = [
    {
      id: 1,
      type: 'training',
      title: 'Completaste el curso de Seguridad Básica',
      description: 'Curso finalizado con 95% de calificación',
      time: '2 horas',
      icon: AcademicCapIcon,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
    },
    {
      id: 2,
      type: 'product',
      title: 'Descargaste el manual de Producto X',
      description: 'Manual técnico en formato PDF',
      time: '1 día',
      icon: DocumentTextIcon,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-50',
    },
    {
      id: 3,
      type: 'support',
      title: 'Nuevo mensaje en ticket de soporte',
      description: 'Respuesta del equipo técnico',
      time: '2 días',
      icon: ChatBubbleLeftRightIcon,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-50',
    },
    {
      id: 4,
      type: 'training',
      title: 'Iniciaste el curso de Productos Avanzados',
      description: 'Progreso: 25% completado',
      time: '3 días',
      icon: AcademicCapIcon,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
        <p className="text-sm text-gray-500 mt-1">
          Últimas acciones realizadas
        </p>
      </div>
      
      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    <div className={`relative px-1`}>
                      <div className={`h-8 w-8 rounded-full ${activity.iconBg} flex items-center justify-center ring-8 ring-white`}>
                        <activity.icon 
                          className={`h-4 w-4 ${activity.iconColor}`} 
                          aria-hidden="true" 
                        />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {activity.title}
                          </p>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {activity.description}
                        </p>
                        <div className="mt-2 flex items-center text-xs text-gray-400">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Hace {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6">
          <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500 font-medium">
            Ver toda la actividad
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;