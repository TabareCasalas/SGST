import { useState, useEffect } from 'react';
import { tramiteService, type Tramite, type CreateTramiteData } from '../services/apiService';

export const useTramites = () => {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar trámites al montar el componente
  useEffect(() => {
    loadTramites();
  }, []);

  const loadTramites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await tramiteService.getAll();
      
      if (response.success && response.data) {
        setTramites(response.data);
      } else {
        setError(response.error || 'Error al cargar trámites');
      }
    } catch (err) {
      setError('Error al cargar trámites');
      console.error('Error loading tramites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTramite = async (data: CreateTramiteData) => {
    try {
      setError(null);
      const response = await tramiteService.create(data);
      
      if (response.success && response.data) {
        setTramites(prev => [response.data!, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Error al crear trámite');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = 'Error al crear trámite';
      setError(errorMsg);
      console.error('Error creating tramite:', err);
      return { success: false, error: errorMsg };
    }
  };

  const updateTramite = async (id: string, data: Partial<CreateTramiteData>) => {
    try {
      setError(null);
      const response = await tramiteService.update(id, data);
      
      if (response.success && response.data) {
        setTramites(prev => 
          prev.map(tramite => 
            tramite.id === id ? response.data! : tramite
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Error al actualizar trámite');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = 'Error al actualizar trámite';
      setError(errorMsg);
      console.error('Error updating tramite:', err);
      return { success: false, error: errorMsg };
    }
  };

  const deleteTramite = async (id: string) => {
    try {
      setError(null);
      const response = await tramiteService.delete(id);
      
      if (response.success) {
        setTramites(prev => prev.filter(tramite => tramite.id !== id));
        return { success: true };
      } else {
        setError(response.error || 'Error al eliminar trámite');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = 'Error al eliminar trámite';
      setError(errorMsg);
      console.error('Error deleting tramite:', err);
      return { success: false, error: errorMsg };
    }
  };

  return {
    tramites,
    isLoading,
    error,
    loadTramites,
    createTramite,
    updateTramite,
    deleteTramite,
  };
};
