import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

/**
 * Hook for data fetching with mock data fallback
 * When API is available, fetches from backend
 * When in mock mode, uses provided mock data
 */
export function useMockData<T>(
  mockData: T,
  fetchFn?: () => Promise<T>
) {
  const [data, setData] = useState<T>(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (api.isMockMode() || !fetchFn) {
      setData(mockData);
      return;
    }

    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      console.warn('API fetch failed, using mock data:', err);
      setData(mockData);
      setError(err instanceof Error ? err.message : 'Fetch failed');
    } finally {
      setLoading(false);
    }
  }, [mockData, fetchFn]);

  const updateData = useCallback((updater: (prev: T) => T) => {
    setData(updater);
  }, []);

  return { data, loading, error, refresh, updateData, setData };
}

/**
 * Hook for CRUD operations with mock data fallback
 */
export function useMockCrud<T extends { id: string }>(
  initialData: T[],
  options?: {
    createFn?: (item: Omit<T, 'id'>) => Promise<T>;
    updateFn?: (id: string, item: Partial<T>) => Promise<T>;
    deleteFn?: (id: string) => Promise<void>;
  }
) {
  const [items, setItems] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (item: Omit<T, 'id'>) => {
    if (!api.isMockMode() && options?.createFn) {
      setLoading(true);
      try {
        const created = await options.createFn(item);
        setItems(prev => [...prev, created]);
        return created;
      } finally {
        setLoading(false);
      }
    }

    // Mock create
    const newItem = { ...item, id: crypto.randomUUID() } as T;
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, [options]);

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    if (!api.isMockMode() && options?.updateFn) {
      setLoading(true);
      try {
        const updated = await options.updateFn(id, updates);
        setItems(prev => prev.map(item => item.id === id ? updated : item));
        return updated;
      } finally {
        setLoading(false);
      }
    }

    // Mock update
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    return { ...items.find(i => i.id === id)!, ...updates };
  }, [items, options]);

  const remove = useCallback(async (id: string) => {
    if (!api.isMockMode() && options?.deleteFn) {
      setLoading(true);
      try {
        await options.deleteFn(id);
        setItems(prev => prev.filter(item => item.id !== id));
      } finally {
        setLoading(false);
      }
    } else {
      // Mock delete
      setItems(prev => prev.filter(item => item.id !== id));
    }
  }, [options]);

  return { items, loading, create, update, remove, setItems };
}
