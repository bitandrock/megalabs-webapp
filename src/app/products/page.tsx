'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Menu, Bell, Flag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ClientDatabaseManager, { Area } from '@/lib/database-client';

export default function ProductAreasPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredAreas, setFilteredAreas] = useState<Area[]>([]);
  const [countryFlag, setCountryFlag] = useState('🏳️');

  // Load product areas on component mount
  useEffect(() => {
    loadAreas();
    if (user?.phone) {
      loadCountryFlag();
    }
  }, [user]);

  // Filter areas based on search text
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredAreas(areas);
    } else {
      const filtered = areas.filter(area =>
        area.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (area.description || '').toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredAreas(filtered);
    }
  }, [searchText, areas]);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const data = await ClientDatabaseManager.loadAreas();
      setAreas(data);
      setFilteredAreas(data);
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCountryFlag = async () => {
    // Country flag functionality removed for client-side compatibility
    setCountryFlag('🌍');
  };

  const handleAreaClick = (areaId: number) => {
    router.push(`/products/area/${areaId}`);
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando áreas de productos...</p>
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
                {/* Notification badge placeholder */}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Áreas de Productos
          </h1>
          <p className="text-gray-600">
            Selecciona un área para explorar los productos disponibles
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar áreas de productos..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Areas List */}
        <div className="space-y-3">
          {filteredAreas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchText ? 'No se encontraron áreas que coincidan con tu búsqueda' : 'No hay áreas de productos disponibles'}
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
            filteredAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => handleAreaClick(area.id)}
                className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {area.name}
                    </h3>
                    {area.description && (
                      <p className="text-gray-600 mt-1 text-sm">
                        {area.description}
                      </p>
                    )}
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
        {filteredAreas.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {filteredAreas.length} área{filteredAreas.length !== 1 ? 's' : ''} disponible{filteredAreas.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}