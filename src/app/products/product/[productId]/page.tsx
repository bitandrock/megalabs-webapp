'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Menu, Bell, Flag, Play, FileText, BookOpen, MessageCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ClientDatabaseManager, { Product } from '@/lib/database-client';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const productId = parseInt(params.productId as string);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [countryFlag, setCountryFlag] = useState('🏳️');

  // Load product details on component mount
  useEffect(() => {
    loadProduct();
    if (user?.phone) {
      loadCountryFlag();
    }
  }, [productId, user]);

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

  const handleBack = () => {
    if (product?.area_id) {
      router.push(`/products/area/${product.area_id}`);
    } else {
      router.push('/products');
    }
  };

  const handleTraining = () => {
    router.push(`/products/product/${productId}/training`);
  };

  const handleFAQ = () => {
    router.push(`/products/product/${productId}/faq`);
  };

  const handleChat = () => {
    router.push(`/products/product/${productId}/chat`);
  };

  const handleVideoClick = () => {
    if (product?.video_url) {
      window.open(product.video_url, '_blank');
    }
  };

  const handlePDFClick = () => {
    if (product?.pdf_url) {
      window.open(product.pdf_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Producto no encontrado</p>
          <button
            onClick={handleBack}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Volver
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
          <span>{product.area?.name}</span>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        {/* Product Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-gray-600 mb-4">
            {product.description || 'Información detallada del producto'}
          </p>

          {/* Media Section */}
          {(product.has_video || product.has_pdf) && (
            <div className="flex flex-wrap gap-3">
              {product.has_video && (
                <button
                  onClick={handleVideoClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>Ver Video</span>
                </button>
              )}
              {product.has_pdf && (
                <button
                  onClick={handlePDFClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Descargar PDF</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Training Card */}
          <button
            onClick={handleTraining}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  Capacitación
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Accede a temas de capacitación, guías y materiales de entrenamiento para este producto.
            </p>
          </button>

          {/* FAQ Card */}
          <button
            onClick={handleFAQ}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <HelpCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  Preguntas Frecuentes
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Encuentra respuestas a las preguntas más comunes sobre este producto.
            </p>
          </button>

          {/* Chat Card */}
          <button
            onClick={handleChat}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 text-left group"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                  Soporte
                </h3>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Inicia una conversación con el equipo de soporte técnico para resolver dudas específicas.
            </p>
          </button>
        </div>

        {/* Product Info */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Información del Producto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Área</h3>
              <p className="text-gray-600">{product.area?.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Recursos Disponibles</h3>
              <div className="flex flex-wrap gap-2">
                {product.has_video && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Play className="h-3 w-3 mr-1" />
                    Video
                  </span>
                )}
                {product.has_pdf && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Capacitación
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  FAQ
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Soporte
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}