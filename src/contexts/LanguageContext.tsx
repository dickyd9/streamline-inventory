import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations, getNestedTranslation } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  const { user } = useAuth();

  // Load language preference from user settings or localStorage
  useEffect(() => {
    const loadLanguage = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_settings')
          .select('language')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.language) {
          setLanguageState(data.language as Language);
        }
      } else {
        const saved = localStorage.getItem('language');
        if (saved === 'en' || saved === 'id') {
          setLanguageState(saved);
        }
      }
    };
    loadLanguage();
  }, [user]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    if (user) {
      // Upsert user settings
      await supabase
        .from('user_settings')
        .upsert({ 
          user_id: user.id, 
          language: lang 
        }, { 
          onConflict: 'user_id' 
        });
    }
  }, [user]);

  const t = useCallback((key: string): string => {
    return getNestedTranslation(translations[language], key);
  }, [language]);

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatDate = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatCurrency, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
