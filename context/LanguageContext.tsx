'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

// Créer le contexte
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Importer les traductions
const translations: Record<Language, any> = {
  fr: require('@/locales/fr.json'),
  ar: require('@/locales/ar.json'),
};

// Provider
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('souk_language') as Language;
    if (saved && (saved === 'fr' || saved === 'ar')) {
      setLanguage(saved);
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = saved;
    }
  }, []);

  // Changer la langue
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('souk_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // Fonction de traduction
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key; // Retourne la clé si non trouvée
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: changeLanguage, 
        t, 
        dir 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personnalisé pour utiliser la langue
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}