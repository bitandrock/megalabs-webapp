'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, ArrowLeft, Menu, Bell, Flag, BookOpen, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ClientDatabaseManager, { TrainingTopic, Product } from '@/lib/database-client';

export default function TrainingTopicsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const productId = parseInt(params.productId as string);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [trainingTopics, setTrainingTopics] = useState<TrainingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredTopics, setFilteredTopics] = useState<TrainingTopic[]>([]);
  const [countryFlag, setCountryFlag] = useState('🏳️');

  // Load training topics and product info on component mount
  useEffect(() => {
    loadTrainingTopics();
    loadProduct();
    if (user?.phone) {
      loadCountryFlag();
    }
  }, [productId, user, loadTrainingTopics, loadProduct]);

  // Filter topics based on search text
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredTopics(trainingTopics);
    } else {
      const filtered = trainingTopics.filter(topic =>
        topic.topic.toLowerCase().includes(searchText.toLowerCase()) ||
        (topic.info || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (topic.content || '').toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [searchText, trainingTopics]);

  const loadTrainingTopics = async () => {
    try {
      const data = await ClientDatabaseManager.getTrainingTopics(productId);
      setTrainingTopics(data);
      setFilteredTopics(data);
    } catch (error) {
      console.error('Error loading training topics:', error);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await ClientDatabaseManager.getProductById(productId);
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCountryFlag = async () => {
    // Country flag functionality removed for client-side compatibility
    setCountryFlag('🌍');
  };

  const handleTopicClick = (topicId: number) => {
    router.push(`/products/product/${productId}/training/${topicId}`);
  };

  const handleBack = () => {
    router.push(`/products/product/${productId}`);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando capacitaciones...</p>
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
          <span>{product?.area?.name}</span>
          <span>›</span>
          <span>{product?.name}</span>
          <span>›</span>
          <span>Capacitación</span>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Capacitación</h1>
              <p className="text-gray-600">{product?.name}</p>
            </div>
          </div>
          <p className="text-gray-600">
            Selecciona un tema de capacitación para acceder al contenido detallado
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar temas de capacitación..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Training Topics List */}
        <div className="space-y-3">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchText 
                  ? 'No se encontraron temas que coincidan con tu búsqueda' 
                  : 'No hay temas de capacitación disponibles para este producto'
                }
              </p>
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="text-green-600 hover:text-green-800"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic.id)}
                className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 hover:border-green-300 transition-all duration-200 text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                        {topic.topic}
                      </h3>
                    </div>
                    
                    {topic.info && (
                      <p className="text-gray-600 text-sm mb-2">
                        {topic.info}
                      </p>
                    )}
                    
                    {/* Content preview */}
                    {topic.content && (
                      <p className="text-gray-500 text-xs line-clamp-2">
                        {topic.content.length > 100 
                          ? topic.content.substring(0, 100) + '...'
                          : topic.content
                        }
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Lectura estimada: {Math.max(1, Math.ceil((topic.content?.length || 0) / 200))} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>Contenido completo</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <ArrowLeft className="h-4 w-4 text-green-600 rotate-180" />
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {filteredTopics.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{filteredTopics.length} tema{filteredTopics.length !== 1 ? 's' : ''} disponible{filteredTopics.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Tiempo estimado total: {' '}
                    {Math.max(1, Math.ceil(
                      filteredTopics.reduce((acc, topic) => acc + (topic.content?.length || 0), 0) / 200
                    ))} minutos
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}