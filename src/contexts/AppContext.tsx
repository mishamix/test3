import { createContext, useContext, ReactNode, useState, useCallback, useRef, useEffect } from 'react';
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
  const [transitionPhase, setTransitionPhase] = useState<'idle' | 'fadeOut' | 'switch' | 'fadeIn'>('idle');
  const scrollRef = useRef(0);

  const t = (key: string): string => getTranslation(language, key);
  const dir = getLangDirection(language);

  const setLanguage = useCallback((lang: Language) => {
    if (lang === language) return;

    scrollRef.current = window.scrollY;
    setTransitionPhase('fadeOut');

    const fadeOutTimer = setTimeout(() => {
      setTransitionPhase('switch');
      baseSetLanguage(lang);

      requestAnimationFrame(() => {
        setTimeout(() => {
          setTransitionPhase('fadeIn');
          window.scrollTo({ top: scrollRef.current, behavior: 'instant' });

          setTimeout(() => {
            setTransitionPhase('idle');
          }, 400);
        }, 50);
      });
    }, 350);

    return () => clearTimeout(fadeOutTimer);
  }, [baseSetLanguage, language]);

  useEffect(() => {
    if (transitionPhase === 'fadeOut' || transitionPhase === 'switch') {
      setIsLanguageTransitioning(true);
    } else {
      setIsLanguageTransitioning(false);
    }
  }, [transitionPhase]);

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
        className={`transition-all duration-[400ms] ease-out ${
          transitionPhase === 'fadeOut'
            ? 'opacity-0'
            : transitionPhase === 'fadeIn'
            ? 'opacity-100 animate-[fadeIn_400ms_ease-out]'
            : 'opacity-100'
        }`}
        style={{ willChange: transitionPhase !== 'idle' ? 'opacity' : 'auto' }}
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
