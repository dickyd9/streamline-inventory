import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, endpoints } from '@/lib/api';

// Define all available feature flags
export interface FeatureFlags {
  // Modules
  pos: boolean;
  inventory: boolean;
  stockMovements: boolean;
  stocktaking: boolean;
  purchaseOrders: boolean;
  salesOrders: boolean;
  invoices: boolean;
  expenses: boolean;
  suppliers: boolean;
  customers: boolean;
  reports: boolean;
  userManagement: boolean;
  activityHistory: boolean;
  
  // Features
  multiPayment: boolean;
  exportPdf: boolean;
  exportExcel: boolean;
  growthAnalytics: boolean;
  lowStockAlerts: boolean;
  approvalWorkflow: boolean;
}

// Default flags (all enabled for development)
const defaultFlags: FeatureFlags = {
  pos: true,
  inventory: true,
  stockMovements: true,
  stocktaking: true,
  purchaseOrders: true,
  salesOrders: true,
  invoices: true,
  expenses: true,
  suppliers: true,
  customers: true,
  reports: true,
  userManagement: true,
  activityHistory: true,
  multiPayment: true,
  exportPdf: true,
  exportExcel: true,
  growthAnalytics: true,
  lowStockAlerts: true,
  approvalWorkflow: true,
};

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  loading: boolean;
  error: string | null;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  refreshFlags: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export function FeatureFlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    // If in mock mode, use default flags
    if (api.isMockMode()) {
      setFlags(defaultFlags);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<FeatureFlags>(endpoints.featureFlags);
      setFlags({ ...defaultFlags, ...response });
      setError(null);
    } catch (err) {
      console.warn('Failed to fetch feature flags, using defaults:', err);
      setFlags(defaultFlags);
      setError(err instanceof Error ? err.message : 'Failed to fetch flags');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const isEnabled = useCallback((flag: keyof FeatureFlags): boolean => {
    return flags[flag] ?? false;
  }, [flags]);

  const refreshFlags = useCallback(async () => {
    await fetchFlags();
  }, [fetchFlags]);

  return (
    <FeatureFlagsContext.Provider value={{ flags, loading, error, isEnabled, refreshFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}

// HOC for feature flag protection
export function withFeatureFlag<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  flag: keyof FeatureFlags,
  FallbackComponent?: React.ComponentType
) {
  return function WithFeatureFlagComponent(props: P) {
    const { isEnabled, loading } = useFeatureFlags();

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isEnabled(flag)) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
