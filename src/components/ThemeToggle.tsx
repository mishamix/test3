import { Sun, Moon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface ThemeToggleProps {
  variant?: 'light' | 'dark';
}

export default function ThemeToggle({ variant = 'light' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useApp();

  const isDarkVariant = variant === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg border transition-all duration-500 ${
        isDarkVariant
          ? 'border-white/30 bg-white/12 hover:bg-white/20 text-white backdrop-blur-sm'
          : 'border-secondary-200/80 dark:border-secondary-700 bg-white/80 dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-800 dark:text-secondary-200 shadow-sm'
      }`}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon className={`w-5 h-5 ${isDarkVariant ? 'text-white' : 'text-secondary-700 dark:text-secondary-200'}`} />
      ) : (
        <Sun className={`w-5 h-5 ${isDarkVariant ? 'text-white' : 'text-secondary-700 dark:text-secondary-200'}`} />
      )}
    </button>
  );
}
