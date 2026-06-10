import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
import { Property, Language } from '../types';
import { useApp } from '../contexts/AppContext';
import { FALLBACK_PROPERTY_IMAGE, getLocationLabel } from '../lib/propertyUtils';
import { memo } from 'react';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = memo(function PropertyCard({ property }: PropertyCardProps) {
  const { language, t } = useApp();

  const title = property.title[language as Language] || property.title.en;
  const location = getLocationLabel(property);
  const mainImage = property.thumbnail_url || property.images[0] || FALLBACK_PROPERTY_IMAGE;
  const areaUnit = property.area_unit === 'sqm' ? 'm²' : t('properties.sqft');

  const formatPrice = (price: number, currency: string) => {
    return `$${price.toLocaleString()} ${currency}`;
  };

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group block bg-white dark:bg-secondary-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-out"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {property.status === 'sold' && (
          <div className="absolute top-4 left-4 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl shadow-xl">
            {t('properties.status.sold')}
          </div>
        )}
        {property.status === 'rented' && (
          <div className="absolute top-4 left-4 px-4 py-2 bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-xl">
            {t('properties.status.rented')}
          </div>
        )}
        {property.is_featured && property.status === 'for_sale' && (
          <div className="absolute top-4 left-4 px-4 py-2 bg-luxury-gold text-white text-sm font-semibold rounded-xl shadow-xl">
            {t('admin.featured')}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-display text-xl font-bold text-secondary-900 dark:text-white mb-3 group-hover:text-luxury-gold transition-colors duration-400 line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center text-secondary-500 dark:text-secondary-400 mb-5">
          <MapPin className="w-4 h-4 mr-2 text-luxury-gold/60" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center gap-5 text-secondary-600 dark:text-secondary-400 text-sm mb-6">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-luxury-gold/60" />
              <span className="font-medium">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-luxury-gold/60" />
              <span className="font-medium">{property.bathrooms}</span>
            </div>
          )}
          {property.area_size > 0 && (
            <div className="flex items-center gap-1.5">
              <Square className="w-4 h-4 text-luxury-gold/60" />
              <span className="font-medium">{property.area_size.toLocaleString()} {areaUnit}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-secondary-100 dark:border-secondary-800">
          <div className="font-display text-2xl font-bold text-luxury-gold">
            {formatPrice(property.price, property.currency)}
          </div>
          <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400 group-hover:text-luxury-gold transition-colors duration-400 flex items-center gap-1">
            {t('common.viewDetails')}
            <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
});

export default PropertyCard;
