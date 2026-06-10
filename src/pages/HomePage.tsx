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
            className="w-full h-full object-cover object-center sm:object-[center_42%] lg:object-center scale-100 transition-transform duration-[10000ms] ease-out hover:scale-105"
            style={{ filter: 'contrast(1.05) saturate(1.1)' }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_60%,rgba(0,0,0,0.5),transparent_60%)]" />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-luxury-cream/20 dark:to-secondary-950/30" />

        <div className="relative z-10 container-custom w-full pb-20 md:pb-24 lg:pb-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-8 animate-fade-in-up border border-white/20">
              <span className="w-2 h-2 rounded-full bg-luxury-gold animate-pulse" />
              <span className="text-white text-sm font-medium tracking-wider uppercase">Morocco's Premier Real Estate</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 animate-fade-in-up animate-delay-200 text-white text-shadow-hero leading-[1.1] tracking-tight">
              {t('hero.title')}
            </h1>

            <p className="text-xl md:text-2xl lg:text-3xl text-white font-light max-w-2xl mb-10 md:mb-12 animate-fade-in-up animate-delay-400 text-shadow-subtitle leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <form
              onSubmit={handleSearch}
              className="max-w-2xl glass-card rounded-2xl p-4 shadow-2xl animate-fade-in-up animate-delay-600"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    options={[
                      { value: '', label: t('hero.searchPlaceholder') },
                      ...ALLOWED_CITIES,
                    ]}
                    className="w-full py-4 text-base rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary rounded-xl py-4 px-10 min-w-[160px]"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {t('common.search')}
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-10 animate-fade-in-up animate-delay-800">
              <Link to="/properties" className="btn btn-outline-white">
                {t('properties.viewAll')}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/about" className="btn text-white border border-white/40 hover:bg-white/15 rounded-xl px-7 py-3.5 transition-all duration-400">
                {t('nav.about')}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-luxury-cream dark:from-secondary-950 to-transparent" />
      </section>

      <section className="py-24 bg-white dark:bg-secondary-900">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-luxury-gold mb-3 transition-transform duration-500 group-hover:scale-110">
                  {stat.number}
                </div>
                <div className="text-secondary-600 dark:text-secondary-400 text-sm md:text-base font-medium tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-heading">{t('properties.featured')}</h2>
            <p className="section-subheading">
              {t('properties.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredProperties.slice(0, 6).map((property, index) => (
                  <div key={property.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
              <div className="text-center mt-16">
                <Link to="/properties" className="btn btn-outline">
                  {t('properties.viewAll')}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-secondary-500 text-lg">{t('properties.noResults')}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-secondary-900 dark:bg-secondary-950">
        <div className="container-custom">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Us
            </h2>
            <p className="text-secondary-400 text-lg max-w-2xl mx-auto">
              Experience excellence in luxury real estate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-10 rounded-3xl bg-secondary-800/40 dark:bg-secondary-900/40 backdrop-blur-sm border border-secondary-700/50 transition-all duration-500 hover:border-luxury-gold/40 hover:shadow-2xl hover:shadow-luxury-gold/10 hover:bg-secondary-800/60 group"
              >
                <div className="w-20 h-20 rounded-2xl bg-luxury-gold/10 flex items-center justify-center mx-auto mb-8 transition-all duration-500 group-hover:scale-110 group-hover:bg-luxury-gold/20 group-hover:rotate-3">
                  <feature.icon className="w-10 h-10 text-luxury-gold" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-secondary-400 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-luxury-gold via-luxury-goldDark to-luxury-gold">
        <div className="container-custom text-center">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 text-shadow-hero">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-white/90 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Contact our team of experts today and let us help you discover the perfect luxury home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/properties" className="btn bg-white text-luxury-gold hover:bg-secondary-100 shadow-xl">
              {t('properties.viewAll')}
            </Link>
            <Link to="/contact" className="btn border-2 border-white text-white hover:bg-white hover:text-luxury-gold shadow-xl">
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
