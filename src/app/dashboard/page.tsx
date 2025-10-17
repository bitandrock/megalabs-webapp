'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import B4iHeader from '@/components/B4iHeader';
import ClientDatabaseManager from '@/lib/database-client';

interface Area {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const DashboardPage = () => {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loadingAreas, setLoadingAreas] = useState(true);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load areas (main menu items like original B4i)
  useEffect(() => {
    const loadAreas = async () => {
      try {
        setLoadingAreas(true);
        const areasData = await ClientDatabaseManager.loadAreas();
        setAreas(areasData);
      } catch (error) {
        console.error('Error loading areas:', error);
      } finally {
        setLoadingAreas(false);
      }
    };

    if (user) {
      loadAreas();
    }
  }, [user]);

  // Filter areas based on search
  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (area.description && area.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleAreaClick = (area: Area) => {
    router.push(`/products/area/${area.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary-blue)' }}></div>
          <p className="b4i-body mt-4" style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* B4i Style Header */}
      <B4iHeader 
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
            placeholder="Buscar área..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="b4i-search"
          />
        </div>
      </div>

      {/* Areas List (Main Menu) */}
      <div className="flex-1">
        {loadingAreas ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary-blue)' }}></div>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {filteredAreas.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--background)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}>
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"></path>
                  </svg>
                </div>
                <h3 className="b4i-subtitle mb-2">No se encontraron áreas</h3>
                <p className="b4i-body" style={{ color: 'var(--text-secondary)' }}>Intenta con otros términos de búsqueda</p>
              </div>
            ) : (
              filteredAreas.map((area, index) => (
                <div
                  key={area.id}
                  onClick={() => handleAreaClick(area)}
                  className="b4i-list-item flex items-center"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ background: 'var(--primary-blue)' }}>
                    <span className="text-white font-semibold text-lg">
                      {area.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="b4i-subtitle mb-1">{area.name}</h3>
                    {area.description && (
                      <p className="b4i-caption" style={{ color: 'var(--text-secondary)' }}>
                        {area.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}>
                      <path d="M9 18l6-6-6-6"></path>
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
