import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Play, Phone, Mail, MessageCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useProperty, useProperties } from '../hooks/useFetchProperties';
import { getLocationLabel } from '../lib/propertyUtils';
import ImageGallery from '../components/ImageGallery';
import PropertyCard from '../components/PropertyCard';
import Loading from '../components/Loading';
import { Language } from '../types';

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useApp();
  const { property, loading, error } = useProperty(id!);
  const { properties: similarProperties } = useProperties({
    propertyType: undefined,
    status: 'for_sale',
    page: 0,
    pageSize: 20,
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">Property not found</h1>
        <p className="text-secondary-600 dark:text-secondary-400 mb-6">The property you are looking for does not exist or has been removed.</p>
        <Link to="/properties" className="btn btn-primary">
          {t('nav.properties')}
        </Link>
      </div>
    );
  }

  const title = property.title[language as Language] || property.title.en;
  const description = property.description[language as Language] || property.description.en;
  const locationLabel = getLocationLabel(property);
  const displayAddress =
    property.full_address || property.address || locationLabel || property.location;
  const hasMapCoordinates =
    property.map_lat != null &&
    property.map_lng != null &&
    !Number.isNaN(property.map_lat) &&
    !Number.isNaN(property.map_lng);
  const mapEmbedUrl = hasMapCoordinates
    ? `https://maps.google.com/maps?q=${property.map_lat},${property.map_lng}&z=15&output=embed`
    : null;
  const areaUnit = property.area_unit === 'sqm' ? 'm²' : t('properties.sqft');
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`I'm interested in: ${title} - $${property.price.toLocaleString()}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this property: ${title}`)}`;

  const filteredSimilar = similarProperties
    .filter((p) => p.id !== property.id && p.property_type === property.property_type)
    .slice(0, 3);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container-custom">
        <div className="mb-8">
          <Link
            to="/properties"
            className="inline-flex items-center text-secondary-600 dark:text-secondary-400 hover:text-luxury-gold dark:hover:text-luxury-gold transition-colors mb-4"
          >
            ← {t('properties.title')}
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 dark:text-white mb-2">
                {title}
              </h1>
              <div className="flex items-center text-secondary-600 dark:text-secondary-400">
                <MapPin className="w-5 h-5 mr-2 text-luxury-gold" />
                <span>{locationLabel}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  property.status === 'for_sale'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : property.status === 'sold'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}
              >
                {t(`properties.status.${property.status}`)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          <div className="lg:col-span-2">
            <ImageGallery images={property.images} alt={title} />

            {property.video_url && (
              <div className="mt-8">
                <h2 className="font-display text-2xl font-semibold text-secondary-900 dark:text-white mb-4 flex items-center">
                  <Play className="w-6 h-6 mr-2 text-luxury-gold" />
                  {t('propertyDetails.videoTour')}
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800">
                  <iframe
                    src={property.video_url}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video tour"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <div className="font-display text-3xl font-bold text-luxury-gold mb-2">
                  ${property.price.toLocaleString()}
                  <span className="text-lg font-normal text-secondary-600 dark:text-secondary-400 ml-2">
                    {property.currency}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-secondary-200 dark:border-secondary-700">
                {property.bedrooms > 0 && (
                  <div className="text-center">
                    <Bed className="w-6 h-6 mx-auto mb-2 text-luxury-gold" />
                    <div className="font-semibold text-secondary-900 dark:text-white">{property.bedrooms}</div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">{t('properties.bedrooms')}</div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="text-center">
                    <Bath className="w-6 h-6 mx-auto mb-2 text-luxury-gold" />
                    <div className="font-semibold text-secondary-900 dark:text-white">{property.bathrooms}</div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">{t('properties.bathrooms')}</div>
                  </div>
                )}
                {property.area_size > 0 && (
                  <div className="text-center">
                    <Square className="w-6 h-6 mx-auto mb-2 text-luxury-gold" />
                    <div className="font-semibold text-secondary-900 dark:text-white">{property.area_size.toLocaleString()}</div>
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">{areaUnit}</div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href="#contact-form"
                  className="btn btn-primary w-full"
                >
                  {t('propertyDetails.inquireNow')}
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t('propertyDetails.whatsappUs')}
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {t('propertyDetails.telegramUs')}
                </a>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400">
                  <Phone className="w-4 h-4 text-luxury-gold" />
                  <span>+971 4 123 4567</span>
                </div>
                <div className="flex items-center gap-3 text-secondary-600 dark:text-secondary-400">
                  <Mail className="w-4 h-4 text-luxury-gold" />
                  <span>info@luxuryestates.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-8 mb-8">
              <h2 className="font-display text-2xl font-semibold text-secondary-900 dark:text-white mb-4">
                {t('propertyDetails.description')}
              </h2>
              <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {property.features && property.features.length > 0 && (
              <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-8 mb-8">
                <h2 className="font-display text-2xl font-semibold text-secondary-900 dark:text-white mb-4">
                  {t('propertyDetails.features')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300"
                    >
                      <div className="w-2 h-2 rounded-full bg-luxury-gold" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(displayAddress || hasMapCoordinates) && (
              <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-8" id="contact-form">
                <h2 className="font-display text-2xl font-semibold text-secondary-900 dark:text-white mb-4">
                  {t('propertyDetails.address')}
                </h2>
                {displayAddress && (
                  <p className="text-secondary-700 dark:text-secondary-300">{displayAddress}</p>
                )}

                {mapEmbedUrl ? (
                  <div className="h-[300px] mt-6 rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800">
                    <iframe
                      src={mapEmbedUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Property location map"
                    />
                  </div>
                ) : (
                  <div className="h-[300px] mt-6 rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800" />
                )}
              </div>
            )}
          </div>
        </div>

        {filteredSimilar.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary-900 dark:text-white mb-8">
              {t('propertyDetails.similarProperties')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSimilar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
