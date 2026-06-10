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
      className="card group block"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {property.status === 'sold' && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
            {t('properties.status.sold')}
          </div>
        )}
        {property.status === 'rented' && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-700 text-white text-sm font-medium rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
            {t('properties.status.rented')}
          </div>
        )}
        {property.is_featured && property.status === 'for_sale' && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-luxury-gold text-white text-sm font-medium rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105">
            {t('admin.featured')}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-lg font-semibold text-secondary-900 dark:text-white group-hover:text-luxury-gold transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
        </div>

        <div className="flex items-center text-secondary-500 dark:text-secondary-400 mb-3 transition-colors duration-300 group-hover:text-luxury-gold/70">
          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center gap-4 text-secondary-600 dark:text-secondary-400 text-sm mb-4">
          {property.bedrooms > 0 && (
            <div className="flex items-center transition-transform duration-300 hover:scale-105">
              <Bed className="w-4 h-4 mr-1 text-luxury-gold/70" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center transition-transform duration-300 hover:scale-105">
              <Bath className="w-4 h-4 mr-1 text-luxury-gold/70" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.area_size > 0 && (
            <div className="flex items-center transition-transform duration-300 hover:scale-105">
              <Square className="w-4 h-4 mr-1 text-luxury-gold/70" />
              <span>{property.area_size.toLocaleString()} {areaUnit}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-secondary-100 dark:border-secondary-800">
          <div className="font-display text-xl font-bold text-luxury-gold transition-transform duration-300 origin-left group-hover:scale-105">
            {formatPrice(property.price, property.currency)}
          </div>
          <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400 group-hover:text-luxury-gold transition-all duration-300 group-hover:translate-x-1">
            {t('common.viewDetails')} →
          </span>
        </div>
      </div>
    </Link>
  );
});

export default PropertyCard;
