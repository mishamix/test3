import { createContext, useContext, ReactNode, useState, useCallback, useRef } from 'react';
import { useLanguage, useTheme } from '../hooks/useFetch';
import { Language, Theme } from '../types';
import { getTranslation, getLangDirection } from '../i18n';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
  isLanguageTransitioning: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage: baseSetLanguage } = useLanguage();
  const { theme, setTheme, toggleTheme } = useTheme();
  const [isLanguageTransitioning, setIsLanguageTransitioning] = useState(false);
  const scrollRef = useRef(0);

  const t = (key: string): string => getTranslation(language, key);
  const dir = getLangDirection(language);

  const setLanguage = useCallback((lang: Language) => {
    scrollRef.current = window.scrollY;
    setIsLanguageTransitioning(true);

    setTimeout(() => {
      baseSetLanguage(lang);
      setTimeout(() => {
        window.scrollTo(0, scrollRef.current);
        setIsLanguageTransitioning(false);
      }, 50);
    }, 150);
  }, [baseSetLanguage]);

  const value: AppContextType = {
    language,
    setLanguage,
    theme,
    setTheme,
    toggleTheme,
    t,
    dir,
    isLanguageTransitioning,
  };

  return (
    <AppContext.Provider value={value}>
      <div
        className={`transition-opacity duration-300 ease-out ${
          isLanguageTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
