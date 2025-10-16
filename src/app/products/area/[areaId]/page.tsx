'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Search, ArrowLeft, Menu, Bell, Flag, Play, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DatabaseManager, { Product, Area } from '@/lib/database-updated';

export default function ProductCategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const areaId = parseInt(params.areaId as string);
  
  const [area, setArea] = useState<Area | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [countryFlag, setCountryFlag] = useState('🏳️');

  // Load products and area info on component mount
  useEffect(() => {
    loadProducts();
    if (user?.phone) {
      loadCountryFlag();
    }
  }, [areaId, user]);

  // Filter products based on search text
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchText, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await DatabaseManager.getProductsByArea(areaId);
      setProducts(data);
      setFilteredProducts(data);
      
      // Get area info from first product or load separately
      if (data.length > 0 && data[0].area) {
        setArea(data[0].area);
      } else {
        // Load area info separately if no products
        const areas = await DatabaseManager.loadAreas();
        const currentArea = areas.find(a => a.id === areaId);
        if (currentArea) {
          setArea(currentArea);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
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

  const handleProductClick = (productId: number) => {
    router.push(`/products/product/${productId}`);
  };

  const handleBack = () => {
    router.push('/products');
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
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
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>Productos</span>
            <span>›</span>
            <span>{area?.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {area?.name || 'Productos'}
          </h1>
          <p className="text-gray-600">
            {area?.description || 'Selecciona un producto para ver más detalles'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchText 
                  ? 'No se encontraron productos que coincidan con tu búsqueda' 
                  : 'No hay productos disponibles en esta área'
                }
              </p>
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-gray-600 mt-1 text-sm">
                        {product.description}
                      </p>
                    )}
                    
                    {/* Media indicators */}
                    <div className="flex items-center space-x-3 mt-2">
                      {product.has_video && (
                        <div className="flex items-center space-x-1 text-xs text-blue-600">
                          <Play className="h-3 w-3" />
                          <span>Video</span>
                        </div>
                      )}
                      {product.has_pdf && (
                        <div className="flex items-center space-x-1 text-xs text-red-600">
                          <FileText className="h-3 w-3" />
                          <span>PDF</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <ArrowLeft className="h-4 w-4 text-blue-600 rotate-180" />
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        {filteredProducts.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} disponible{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}