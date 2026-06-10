import { useState, useEffect, useMemo } from 'react';
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
      setIsScrolled(window.scrollY > 20);
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

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navbarStyles = useMemo(() => {
    if (isScrolled) {
      return 'bg-white/95 dark:bg-secondary-900/95 backdrop-blur-xl shadow-lg border-b border-secondary-200/80 dark:border-secondary-700/70';
    }
    if (isHomePage) {
      return 'bg-transparent border-b border-transparent';
    }
    return 'bg-white/85 dark:bg-secondary-900/85 backdrop-blur-xl border-b border-secondary-200/70 dark:border-secondary-700/60';
  }, [isScrolled, isHomePage]);

  const textColorStyles = useMemo(() => {
    if (isScrolled) {
      return 'text-secondary-800 dark:text-secondary-200';
    }
    if (isHomePage && !isScrolled) {
      return 'text-white';
    }
    return 'text-secondary-800 dark:text-secondary-200';
  }, [isScrolled, isHomePage]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-out ${navbarStyles}`}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            to="/"
            className="brand-logo-link flex items-center shrink-0 min-w-0 max-w-[50%] sm:max-w-[45%] md:max-w-[320px] bg-transparent"
          >
            <BrandLogo
              loading="eager"
              fetchPriority="high"
              className={`h-10 w-auto max-w-full md:h-[50px] lg:h-[60px] transition-all duration-500 ${
                isHomePage && !isScrolled ? 'drop-shadow-lg brightness-0 invert' : ''
              }`}
            />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActive(to)
                    ? 'text-luxury-gold bg-luxury-gold/12'
                    : `${textColorStyles} hover:text-luxury-gold hover:bg-luxury-gold/8`
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher variant={isHomePage && !isScrolled ? 'dark' : 'light'} />
            <ThemeToggle variant={isHomePage && !isScrolled ? 'dark' : 'light'} />
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
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isHomePage && !isScrolled
                ? 'text-white hover:bg-white/15'
                : 'text-secondary-800 dark:text-secondary-200 hover:bg-secondary-100/90 dark:hover:bg-secondary-800'
            }`}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/98 dark:bg-secondary-900/98 backdrop-blur-md border-t border-secondary-200 dark:border-secondary-700">
          <div className="container-custom py-4 space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive(to)
                    ? 'text-luxury-gold bg-luxury-gold/12'
                    : 'text-secondary-800 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-secondary-800 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800"
            >
              <Settings className="w-5 h-5" />
              {t('nav.admin')}
            </Link>
            <div className="flex items-center gap-3 px-4 py-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
