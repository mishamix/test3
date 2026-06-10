import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, MapPinned, Shield, Award } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useFeaturedProperties } from '../hooks/useFetchProperties';
import PropertyCard from '../components/PropertyCard';
import { SkeletonCard } from '../components/Loading';
import Select from '../components/Select';

const ALLOWED_CITIES = [
  { value: 'Casablanca', label: 'Casablanca' },
  { value: 'Tanger', label: 'Tanger' },
  { value: 'Marrakech', label: 'Marrakech' },
];

export default function HomePage() {
  const { t } = useApp();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const { properties: featuredProperties, loading } = useFeaturedProperties();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set('location', selectedCity);
    navigate(`/properties?${params.toString()}`);
  };

  const stats = [
    { number: '500+', label: t('about.stats.propertiesSold') },
    { number: '1000+', label: t('about.stats.happyClients') },
    { number: '20+', label: t('about.stats.yearsExperience') },
    { number: '50+', label: t('about.stats.countries') },
  ];

  const features = [
    {
      icon: MapPinned,
      title: t('about.values.excellence.title'),
      description: t('about.values.excellence.description'),
    },
    {
      icon: Shield,
      title: t('about.values.integrity.title'),
      description: t('about.values.integrity.description'),
    },
    {
      icon: Award,
      title: t('about.values.dedication.title'),
      description: t('about.values.dedication.description'),
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-luxury-interior.png"
            alt="Luxury countryside estate at golden sunset"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover object-center sm:object-[center_42%] lg:object-center scale-100 transition-transform duration-[7000ms] ease-out hover:scale-105"
            style={{ filter: 'contrast(1.03) saturate(1.08)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(0,0,0,0.30),transparent_55%)]" />
        </div>

        <div className="relative z-10 container-custom w-full pb-16 md:pb-20 lg:pb-24">
          <div className="max-w-3xl text-left">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 animate-fade-in-up">
              <span className="text-white/90 text-sm font-medium tracking-wide">Morocco's Premier Real Estate</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold mb-5 animate-fade-in-up animate-delay-200 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/95 max-w-2xl mb-8 md:mb-10 animate-fade-in-up animate-delay-400 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <form
              onSubmit={handleSearch}
              className="max-w-2xl bg-white/95 dark:bg-secondary-900/95 backdrop-blur-lg rounded-2xl p-3 shadow-2xl border border-white/60 dark:border-secondary-700 animate-fade-in-up animate-delay-600"
            >
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    options={[
                      { value: '', label: t('hero.searchPlaceholder') },
                      ...ALLOWED_CITIES,
                    ]}
                    className="w-full py-4 text-base"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary rounded-xl py-4 px-8 min-w-[140px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {t('common.search')}
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8 animate-fade-in-up animate-delay-800">
              <Link to="/properties" className="btn btn-outline-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                {t('properties.viewAll')}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
              <Link to="/about" className="btn btn-ghost text-white border border-white/35 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                {t('nav.about')}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-luxury-cream/90 dark:from-secondary-950/95 to-transparent" />
      </section>

      <section className="py-20 bg-white dark:bg-secondary-900">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="font-display text-4xl md:text-5xl font-bold text-luxury-gold mb-2 transition-transform duration-300 group-hover:scale-105">
                  {stat.number}
                </div>
                <div className="text-secondary-600 dark:text-secondary-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading">{t('properties.featured')}</h2>
            <p className="section-subheading max-w-2xl mx-auto">
              {t('properties.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProperties.slice(0, 6).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link to="/properties" className="btn btn-outline transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  {t('properties.viewAll')}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary-500">{t('properties.noResults')}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-secondary-900 dark:bg-secondary-950">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-secondary-800/50 dark:bg-secondary-900/50 backdrop-blur-sm border border-secondary-700 transition-all duration-500 hover:border-luxury-gold/30 hover:shadow-xl hover:shadow-luxury-gold/5 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 flex items-center justify-center mx-auto mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:bg-luxury-gold/20">
                  <feature.icon className="w-8 h-8 text-luxury-gold" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-secondary-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-luxury-gold">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-sm">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Contact our team of experts today and let us help you discover the perfect luxury home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/properties" className="btn bg-white text-luxury-gold hover:bg-secondary-100 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              {t('properties.viewAll')}
            </Link>
            <Link to="/contact" className="btn border-2 border-white text-white hover:bg-white hover:text-luxury-gold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
