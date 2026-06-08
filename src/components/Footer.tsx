import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const { t } = useApp();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-900 text-secondary-300 mt-20">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="brand-logo-link inline-flex items-center mb-6 bg-transparent">
              <BrandLogo className="h-10 w-auto max-w-[220px] md:h-[50px] lg:h-[55px]" />
            </Link>
            <p className="text-secondary-400 mb-6 leading-relaxed">
              Your trusted partner in luxury real estate. We connect discerning buyers with exceptional properties in the world's most prestigious locations.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary-800 hover:bg-luxury-gold flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary-800 hover:bg-luxury-gold flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary-800 hover:bg-luxury-gold flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary-800 hover:bg-luxury-gold flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">{t('nav.properties')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/properties?type=house" className="hover:text-luxury-gold transition-colors">
                  {t('nav.houses')}
                </Link>
              </li>
              <li>
                <Link to="/properties?type=apartment" className="hover:text-luxury-gold transition-colors">
                  {t('nav.apartments')}
                </Link>
              </li>
              <li>
                <Link to="/properties?type=villa" className="hover:text-luxury-gold transition-colors">
                  {t('properties.types.villa')}
                </Link>
              </li>
              <li>
                <Link to="/properties?type=penthouse" className="hover:text-luxury-gold transition-colors">
                  {t('properties.types.penthouse')}
                </Link>
              </li>
              <li>
                <Link to="/properties?featured=true" className="hover:text-luxury-gold transition-colors">
                  {t('properties.featured')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">{t('nav.about')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="hover:text-luxury-gold transition-colors">
                  {t('about.story.title')}
                </Link>
              </li>
              <li>
                <Link to="/about#values" className="hover:text-luxury-gold transition-colors">
                  {t('about.values.title')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-luxury-gold transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">{t('contact.info.title')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                <span>Downtown Dubai, Burj Khalifa Tower, Level 120, Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                <span>+971 4 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                <span>info@luxuryestates.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-secondary-800">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-secondary-500 text-sm">
            © {currentYear} Anastelle Immo. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-secondary-500 hover:text-secondary-300 transition-colors">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-secondary-500 hover:text-secondary-300 transition-colors">
              {t('footer.terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
