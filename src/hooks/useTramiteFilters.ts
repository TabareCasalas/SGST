import { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';

export const useTramiteFilters = () => {
  const { tramites } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const filteredTramites = useMemo(() => {
    return tramites.filter((tramite) => {
      // Filtro por búsqueda
      const matchesSearch = searchTerm === '' || 
        tramite.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tramite.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tramite.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tramite.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por estado
      const matchesStatus = statusFilter === '' || tramite.status === statusFilter;

      // Filtro por prioridad
      const matchesPriority = priorityFilter === '' || tramite.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tramites, searchTerm, statusFilter, priorityFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== '' || priorityFilter !== '';

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    filteredTramites,
    clearFilters,
    hasActiveFilters,
    totalTramites: tramites.length,
    filteredCount: filteredTramites.length
  };
};