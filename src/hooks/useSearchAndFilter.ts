import { useState, useMemo, useCallback } from 'react';

interface FilterState {
  search: string;
  status: string;
  type: string;
  role: string;
}

export const useSearchAndFilter = <T>(
  data: T[],
  searchFields: (keyof T)[],
  filterConfig?: {
    statusField?: keyof T;
    typeField?: keyof T;
    roleField?: keyof T;
  }
) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    type: '',
    role: ''
  });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchMatch = searchFields.some(field => {
          const value = item[field];
          if (value && typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          return false;
        });
        if (!searchMatch) return false;
      }

      // Filtros
      if (filters.status && filterConfig?.statusField) {
        const statusValue = item[filterConfig.statusField];
        if (statusValue !== filters.status) return false;
      }

      if (filters.type && filterConfig?.typeField) {
        const typeValue = item[filterConfig.typeField];
        if (typeValue !== filters.type) return false;
      }

      if (filters.role && filterConfig?.roleField) {
        const roleValue = item[filterConfig.roleField];
        if (roleValue !== filters.role) return false;
      }

      return true;
    });
  }, [data, filters, searchFields, filterConfig]);

  const handleSearch = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  }, []);

  const handleFilter = useCallback((filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      type: '',
      role: ''
    });
  }, []);

  const getFilterOptions = useCallback((field: keyof T) => {
    const uniqueValues = [...new Set(data.map(item => item[field]))];
    return uniqueValues
      .filter(value => value !== undefined && value !== null && value !== '')
      .map(value => ({
        value: String(value),
        label: String(value)
      }));
  }, [data]);

  return {
    filteredData,
    filters,
    handleSearch,
    handleFilter,
    clearFilters,
    getFilterOptions
  };
}; 