import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Building2, Info, Phone, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const { t } = useApp();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 30);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/properties', label: t('nav.properties'), icon: Building2 },
    { to: '/about', label: t('nav.about'), icon: Info },
    { to: '/contact', label: t('nav.contact'), icon: Phone },
  ];

  const isActive = useCallback((path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  const isTransparentNavbar = isHomePage && !isScrolled;

  const navbarStyles = useMemo(() => {
    if (isScrolled) {
      return 'bg-white/98 dark:bg-secondary-900/98 backdrop-blur-xl shadow-xl border-b border-secondary-200/60 dark:border-secondary-700/50';
    }
    if (isHomePage) {
      return 'bg-transparent';
    }
    return 'bg-white/90 dark:bg-secondary-900/90 backdrop-blur-xl border-b border-secondary-200/50 dark:border-secondary-700/40';
  }, [isScrolled, isHomePage]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${navbarStyles}`}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20 md:h-24 lg:h-28">
          <Link
            to="/"
            className="brand-logo-link flex items-center shrink-0 min-w-0 max-w-[55%] sm:max-w-[50%] md:max-w-[400px] bg-transparent py-2"
          >
            <BrandLogo
              loading="eager"
              fetchPriority="high"
              className={`h-14 w-auto max-w-full sm:h-16 md:h-[70px] lg:h-[80px] transition-all duration-500 ease-out ${
                isTransparentNavbar ? 'brightness-0 invert drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]' : ''
              }`}
            />
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-400 ease-out ${
                  isActive(to)
                    ? 'text-luxury-gold bg-luxury-gold/15'
                    : isTransparentNavbar
                    ? 'text-white/95 hover:text-white hover:bg-white/15'
                    : 'text-secondary-700 dark:text-secondary-200 hover:text-luxury-gold hover:bg-luxury-gold/10'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher variant={isTransparentNavbar ? 'dark' : 'light'} />
            <ThemeToggle variant={isTransparentNavbar ? 'dark' : 'light'} />
            <Link
              to="/admin"
              className="btn btn-primary text-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              {t('nav.admin')}
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-3 rounded-xl transition-all duration-400 ease-out ${
              isTransparentNavbar
                ? 'text-white hover:bg-white/15'
                : 'text-secondary-800 dark:text-secondary-200 hover:bg-secondary-100/90 dark:hover:bg-secondary-800'
            }`}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
          isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/99 dark:bg-secondary-900/99 backdrop-blur-xl border-t border-secondary-200 dark:border-secondary-700 shadow-2xl">
          <div className="container-custom py-5 space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl font-medium transition-all duration-300 ${
                  isActive(to)
                    ? 'text-luxury-gold bg-luxury-gold/15'
                    : 'text-secondary-800 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="flex items-center gap-4 px-5 py-4 rounded-xl font-medium text-secondary-800 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-300"
            >
              <Settings className="w-5 h-5" />
              {t('nav.admin')}
            </Link>
            <div className="flex items-center gap-4 px-5 py-4">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
