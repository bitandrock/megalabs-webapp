'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Menu, Bell, Flag, BookOpen, Clock, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DatabaseManager, { TrainingTopic } from '@/lib/database-updated';

export default function TrainingTopicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const productId = parseInt(params.productId as string);
  const topicId = parseInt(params.topicId as string);
  
  const [topic, setTopic] = useState<TrainingTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [countryFlag, setCountryFlag] = useState('🏳️');
  const [readingTime, setReadingTime] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Load training topic details on component mount
  useEffect(() => {
    loadTopic();
    if (user?.phone) {
      loadCountryFlag();
    }
  }, [topicId, user]);

  // Calculate reading time when topic loads
  useEffect(() => {
    if (topic?.content) {
      const estimatedTime = Math.max(1, Math.ceil(topic.content.length / 200));
      setReadingTime(estimatedTime);
    }
  }, [topic]);

  const loadTopic = async () => {
    try {
      setLoading(true);
      const data = await DatabaseManager.getTrainingTopicById(topicId);
      setTopic(data);
    } catch (error) {
      console.error('Error loading training topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCountryFlag = async () => {
    if (user?.phone) {
      const flag = await DatabaseManager.getCountryFromPhone(user.phone);
      setCountryFlag(flag);
    }
  };

  const handleBack = () => {
    router.push(`/products/product/${productId}/training`);
  };

  const handleComplete = () => {
    setCompleted(true);
    // Here you could save completion status to database
    // await DatabaseManager.markTrainingComplete(user.id, topicId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Tema de capacitación no encontrado</p>
          <button
            onClick={handleBack}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Back button */}
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>

            {/* Center - Logo and user info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.username || 'Usuario'}
                </p>
                <div className="flex items-center space-x-1">
                  <Flag className="h-3 w-3 text-gray-400" />
                  <span className="text-sm">{countryFlag}</span>
                </div>
              </div>
            </div>

            {/* Right side - Menu and notifications */}
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="h-6 w-6 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <span>Productos</span>
          <span>›</span>
          <span>{topic.product?.area?.name}</span>
          <span>›</span>
          <span>{topic.product?.name}</span>
          <span>›</span>
          <span>Capacitación</span>
          <span>›</span>
          <span className="truncate">{topic.topic}</span>
        </div>

        {/* Topic Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                completed ? 'bg-green-500' : 'bg-green-100'
              }`}>
                {completed ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <BookOpen className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {topic.topic}
                </h1>
                {topic.info && (
                  <p className="text-gray-600 mb-3">
                    {topic.info}
                  </p>
                )}
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Tiempo estimado: {readingTime} minuto{readingTime !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>Contenido completo</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Producto: {topic.product?.name}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Complete button */}
            {!completed && (
              <button
                onClick={handleComplete}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Marcar como completado</span>
              </button>
            )}
            
            {completed && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span>Completado</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Content Header */}
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Contenido del Tema</h2>
          </div>
          
          {/* Scrollable Content Area - matching original producto.bas */}
          <div className="p-6">
            <div 
              className="max-h-96 overflow-y-auto pr-4"
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E0 #F7FAFC'
              }}
            >
              <div className="prose prose-gray max-w-none">
                {topic.content ? (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {topic.content}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No hay contenido disponible para este tema.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a la lista</span>
          </button>
          
          <div className="flex items-center space-x-3">
            {!completed && (
              <button
                onClick={handleComplete}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Completar Capacitación</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-gray-600">
                Estado: {completed ? 'Completado' : 'En progreso'}
              </span>
            </div>
            <div className="text-gray-500">
              Tema {topicId} • {topic.product?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .prose ::-webkit-scrollbar {
          width: 8px;
        }
        .prose ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .prose ::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }
        .prose ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}