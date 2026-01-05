/**
 * API Wrapper for backend integration
 * Currently uses mock data, can be switched to real API by setting BASE_URL
 */

interface ApiConfig {
  baseUrl: string;
  useMock: boolean;
}

const config: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  useMock: !import.meta.env.VITE_API_BASE_URL,
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private useMock: boolean;
  private authToken: string | null = null;

  constructor(apiConfig: ApiConfig) {
    this.baseUrl = apiConfig.baseUrl;
    this.useMock = apiConfig.useMock;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.authToken) {
      requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Generic CRUD operations
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  isMockMode(): boolean {
    return this.useMock;
  }
}

export const api = new ApiClient(config);

// Type-safe API endpoints
export const endpoints = {
  // Products
  products: {
    list: '/api/products',
    get: (id: string) => `/api/products/${id}`,
    create: '/api/products',
    update: (id: string) => `/api/products/${id}`,
    delete: (id: string) => `/api/products/${id}`,
  },
  // Categories
  categories: {
    list: '/api/categories',
    get: (id: string) => `/api/categories/${id}`,
  },
  // Suppliers
  suppliers: {
    list: '/api/suppliers',
    get: (id: string) => `/api/suppliers/${id}`,
    create: '/api/suppliers',
    update: (id: string) => `/api/suppliers/${id}`,
    delete: (id: string) => `/api/suppliers/${id}`,
  },
  // Customers
  customers: {
    list: '/api/customers',
    get: (id: string) => `/api/customers/${id}`,
    create: '/api/customers',
    update: (id: string) => `/api/customers/${id}`,
    delete: (id: string) => `/api/customers/${id}`,
  },
  // Purchase Orders
  purchaseOrders: {
    list: '/api/purchase-orders',
    get: (id: string) => `/api/purchase-orders/${id}`,
    create: '/api/purchase-orders',
    update: (id: string) => `/api/purchase-orders/${id}`,
    delete: (id: string) => `/api/purchase-orders/${id}`,
  },
  // Sales Orders
  salesOrders: {
    list: '/api/sales-orders',
    get: (id: string) => `/api/sales-orders/${id}`,
    create: '/api/sales-orders',
    update: (id: string) => `/api/sales-orders/${id}`,
    delete: (id: string) => `/api/sales-orders/${id}`,
  },
  // Stock Movements
  stockMovements: {
    list: '/api/stock-movements',
    get: (id: string) => `/api/stock-movements/${id}`,
    create: '/api/stock-movements',
  },
  // Expenses
  expenses: {
    list: '/api/expenses',
    get: (id: string) => `/api/expenses/${id}`,
    create: '/api/expenses',
    update: (id: string) => `/api/expenses/${id}`,
    delete: (id: string) => `/api/expenses/${id}`,
    categories: '/api/expense-categories',
  },
  // POS
  pos: {
    transactions: '/api/pos/transactions',
    get: (id: string) => `/api/pos/transactions/${id}`,
    create: '/api/pos/transactions',
    update: (id: string) => `/api/pos/transactions/${id}`,
  },
  // Reports
  reports: {
    sales: '/api/reports/sales',
    purchases: '/api/reports/purchases',
    inventory: '/api/reports/inventory',
    expenses: '/api/reports/expenses',
  },
  // Feature Flags
  featureFlags: '/api/feature-flags',
  // Auth
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
};
