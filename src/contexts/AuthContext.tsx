import React, { createContext, useContext, useState, useCallback } from 'react';

// Demo users for testing
const DEMO_USERS = [
  { id: '1', email: 'owner@invenpro.id', password: 'owner123', fullName: 'Owner Demo', role: 'owner' as const },
  { id: '2', email: 'staff@invenpro.id', password: 'staff123', fullName: 'Staff Demo', role: 'staff' as const },
  { id: '3', email: 'admin@invenpro.id', password: 'admin123', fullName: 'Admin Demo', role: 'admin' as const },
];

type AppRole = 'admin' | 'owner' | 'staff';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface Session {
  user: User;
  accessToken: string;
  expiresAt: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEY = 'invenpro_auth';

// Helper to get stored auth
const getStoredAuth = (): { user: User; session: Session; role: AppRole } | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if session is expired
      if (parsed.session.expiresAt > Date.now()) {
        return parsed;
      }
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
};

// Helper to store auth
const storeAuth = (user: User, session: Session, role: AppRole) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, session, role }));
};

// Helper to clear auth
const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from storage
  const storedAuth = getStoredAuth();
  
  const [user, setUser] = useState<User | null>(storedAuth?.user ?? null);
  const [session, setSession] = useState<Session | null>(storedAuth?.session ?? null);
  const [role, setRole] = useState<AppRole | null>(storedAuth?.role ?? null);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find demo user
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    
    if (demoUser) {
      const newUser: User = {
        id: demoUser.id,
        email: demoUser.email,
        fullName: demoUser.fullName,
      };
      
      const newSession: Session = {
        user: newUser,
        accessToken: `demo_token_${Date.now()}`,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };
      
      setUser(newUser);
      setSession(newSession);
      setRole(demoUser.role);
      storeAuth(newUser, newSession, demoUser.role);
      setLoading(false);
      
      return { error: null };
    }
    
    setLoading(false);
    return { error: new Error('Email atau password salah') };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if email already exists
    if (DEMO_USERS.some(u => u.email === email)) {
      setLoading(false);
      return { error: new Error('Email sudah terdaftar') };
    }
    
    // In a real app, this would create a new user
    // For demo, we'll simulate success and auto-login as staff
    const newUser: User = {
      id: Date.now().toString(),
      email,
      fullName,
    };
    
    const newSession: Session = {
      user: newUser,
      accessToken: `demo_token_${Date.now()}`,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    
    setUser(newUser);
    setSession(newSession);
    setRole('staff');
    storeAuth(newUser, newSession, 'staff');
    setLoading(false);
    
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setUser(null);
    setSession(null);
    setRole(null);
    clearAuth();
    setLoading(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In demo mode, just return success
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, role, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
