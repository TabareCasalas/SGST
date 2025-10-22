import { useState, useEffect } from 'react';
import { tramiteService } from '../services/tramiteService';
import type { Tramite, CreateTramiteRequest, UpdateTramiteRequest } from '../types/tramites';

export const useTramites = () => {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTramites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tramiteService.getAllTramites();
      setTramites(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar trámites');
      console.error('Error fetching tramites:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTramite = async (tramiteData: CreateTramiteRequest) => {
    try {
      setError(null);
      const newTramite = await tramiteService.createTramite(tramiteData);
      setTramites(prev => [...prev, newTramite]);
      return newTramite;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear trámite';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTramite = async (id: number, tramiteData: UpdateTramiteRequest) => {
    try {
      setError(null);
      const updatedTramite = await tramiteService.updateTramite(id, tramiteData);
      setTramites(prev => prev.map(tramite => tramite.id_tramite === id ? updatedTramite : tramite));
      return updatedTramite;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar trámite';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTramite = async (id: number) => {
    try {
      setError(null);
      await tramiteService.deleteTramite(id);
      setTramites(prev => prev.filter(tramite => tramite.id_tramite !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar trámite';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchTramites();
  }, []);

  return {
    tramites,
    loading,
    error,
    createTramite,
    updateTramite,
    deleteTramite,
    refetch: fetchTramites
  };
};