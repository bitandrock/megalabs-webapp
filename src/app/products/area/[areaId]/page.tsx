'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import B4iHeader from '@/components/B4iHeader';
import ClientDatabaseManager from '@/lib/database-client';

interface Product {
  id: number;
  area_id: number;
  name: string;
  description?: string;
  has_video: boolean;
  has_pdf: boolean;
  video_url?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  area?: Area;
}

interface Area {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

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
  // Load products and area info on component mount
  useEffect(() => {
    loadProducts();
  }, [areaId, user, loadProducts]);

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
      const data = await ClientDatabaseManager.getProductsByArea(areaId);
      setProducts(data);
      setFilteredProducts(data);
      
      // Get area info from first product or load separately
      if (data.length > 0 && data[0].area) {
        setArea(data[0].area);
      } else {
        // Load area info separately if no products
        const areas = await ClientDatabaseManager.loadAreas();
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


  const handleProductClick = (productId: number) => {
    router.push(`/products/product/${productId}`);
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary-blue)' }}></div>
          <p className="b4i-body mt-4" style={{ color: 'var(--text-secondary)' }}>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* B4i Style Header */}
      <B4iHeader 
        title={area?.name || 'Productos'}
        showBackButton={true}
        onBackClick={handleBack}
        showNotifications={true}
        notificationCount={0}
      />

      {/* Search Section */}
      <div className="p-4" style={{ background: 'var(--card-background)' }}>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="b4i-search"
          />
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--background)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"></path>
              </svg>
            </div>
            <h3 className="b4i-subtitle mb-2">
              {searchText 
                ? 'No se encontraron productos' 
                : 'No hay productos disponibles'
              }
            </h3>
            <p className="b4i-body" style={{ color: 'var(--text-secondary)' }}>
              {searchText 
                ? 'Intenta con otros términos de búsqueda'
                : 'Esta área no tiene productos disponibles'
              }
            </p>
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="b4i-button-secondary mt-4"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="b4i-list-item flex items-center"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ background: 'var(--primary-blue)' }}>
                  <span className="text-white font-semibold text-lg">
                    {product.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="b4i-subtitle mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="b4i-caption mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {product.description}
                    </p>
                  )}
                  
                  {/* Media indicators */}
                  <div className="flex items-center space-x-3">
                    {product.has_video && (
                      <div className="flex items-center space-x-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary-blue)' }}>
                          <polygon points="5,3 19,12 5,21"></polygon>
                        </svg>
                        <span className="b4i-caption" style={{ color: 'var(--primary-blue)' }}>Video</span>
                      </div>
                    )}
                    {product.has_pdf && (
                      <div className="flex items-center space-x-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--error-color)' }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14,2 14,8 20,8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                        <span className="b4i-caption" style={{ color: 'var(--error-color)' }}>PDF</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}>
                    <path d="M9 18l6-6-6-6"></path>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}