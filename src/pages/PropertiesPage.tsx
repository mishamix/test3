import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid2x2 as Grid, List, X } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useProperties } from '../hooks/useFetchProperties';
import PropertyCard from '../components/PropertyCard';
import { SkeletonCard } from '../components/Loading';
import Input from '../components/Input';
import Select from '../components/Select';

const ALLOWED_CITIES = [
  { value: '', label: 'All Cities' },
  { value: 'Casablanca', label: 'Casablanca' },
  { value: 'Tanger', label: 'Tanger' },
  { value: 'Marrakech', label: 'Marrakech' },
];

export default function PropertiesPage() {
  const { t } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState({
    search: searchParams.get('location') || '',
    propertyType: searchParams.get('type') || 'all',
    status: searchParams.get('status') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minBedrooms: searchParams.get('bedrooms') || 'all',
    minBathrooms: searchParams.get('bathrooms') || 'all',
    sortBy: (searchParams.get('sort') as 'newest' | 'price-asc' | 'price-desc') || 'newest',
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  const queryFilters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      propertyType: filters.propertyType !== 'all' ? filters.propertyType : undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minBedrooms:
        filters.minBedrooms !== 'all' ? Number(filters.minBedrooms) : undefined,
      minBathrooms:
        filters.minBathrooms !== 'all' ? Number(filters.minBathrooms) : undefined,
      featured: searchParams.get('featured') === 'true' || undefined,
      sortBy: filters.sortBy,
      page: 0,
      pageSize: 12,
    }),
    [
      debouncedSearch,
      filters.propertyType,
      filters.status,
      filters.minPrice,
      filters.maxPrice,
      filters.minBedrooms,
      filters.minBathrooms,
      filters.sortBy,
      searchParams,
    ]
  );

  const { properties, loading, loadingMore, hasMore, total, loadMore } = useProperties(queryFilters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set('location', filters.search);
    if (filters.propertyType !== 'all') params.set('type', filters.propertyType);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.minBedrooms !== 'all') params.set('bedrooms', filters.minBedrooms);
    if (filters.minBathrooms !== 'all') params.set('bathrooms', filters.minBathrooms);
    if (filters.sortBy !== 'newest') params.set('sort', filters.sortBy);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      propertyType: 'all',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      minBedrooms: 'all',
      minBathrooms: 'all',
      sortBy: 'newest',
    });
    setSearchParams({});
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search ||
      filters.propertyType !== 'all' ||
      filters.status !== 'all' ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.minBedrooms !== 'all' ||
      filters.minBathrooms !== 'all' ||
      filters.sortBy !== 'newest'
    );
  }, [filters]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="section-heading">{t('properties.title')}</h1>
          <p className="section-subheading">{t('properties.subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-4 md:p-6 mb-8 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                options={ALLOWED_CITIES.map(c => ({ value: c.value, label: c.label }))}
                className="w-full"
              />
              <Select
                value={filters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                options={[
                  { value: 'all', label: t('properties.propertyType') },
                  { value: 'house', label: t('properties.types.house') },
                  { value: 'apartment', label: t('properties.types.apartment') },
                  { value: 'villa', label: t('properties.types.villa') },
                  { value: 'penthouse', label: t('properties.types.penthouse') },
                ]}
                className="w-full"
              />
              <Input
                type="number"
                placeholder="Min Price ($)"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full"
              />
              <Input
                type="number"
                placeholder="Max Price ($)"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full"
              />
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'for_sale', label: t('properties.status.for_sale') },
                  { value: 'sold', label: t('properties.status.sold') },
                  { value: 'rented', label: t('properties.status.rented') },
                ]}
                className="w-full"
              />
              <Select
                value={filters.minBedrooms}
                onChange={(e) => handleFilterChange('minBedrooms', e.target.value)}
                options={[
                  { value: 'all', label: t('properties.bedrooms') },
                  { value: '1', label: '1+' },
                  { value: '2', label: '2+' },
                  { value: '3', label: '3+' },
                  { value: '4', label: '4+' },
                  { value: '5', label: '5+' },
                ]}
                className="w-full"
              />
              <Select
                value={filters.minBathrooms}
                onChange={(e) => handleFilterChange('minBathrooms', e.target.value)}
                options={[
                  { value: 'all', label: t('properties.bathrooms') },
                  { value: '1', label: '1+' },
                  { value: '2', label: '2+' },
                  { value: '3', label: '3+' },
                  { value: '4', label: '4+' },
                ]}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={handleSearch} className="btn btn-primary flex-1 md:flex-none transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <Search className="w-4 h-4 mr-2" />
                {t('common.search')}
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-ghost transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                  <X className="w-4 h-4 mr-2" />
                  {t('common.clear')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-secondary-600 dark:text-secondary-400">
            {loading ? '...' : total} {t('properties.allProperties').toLowerCase()} found
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-600 dark:text-secondary-400 hidden sm:inline">
              {t('properties.sortBy')}:
            </span>
            <Select
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange('sortBy', e.target.value as 'newest' | 'price-asc' | 'price-desc')
              }
              options={[
                { value: 'newest', label: t('properties.newest') },
                { value: 'price-desc', label: t('properties.priceHighToLow') },
                { value: 'price-asc', label: t('properties.priceLowToHigh') },
              ]}
              className="w-auto min-w-[160px]"
            />
            <div className="hidden sm:flex items-center gap-1 border border-secondary-200 dark:border-secondary-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all duration-200 ${viewMode === 'grid' ? 'bg-luxury-gold text-white' : 'hover:bg-secondary-100 dark:hover:bg-secondary-800'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all duration-200 ${viewMode === 'list' ? 'bg-luxury-gold text-white' : 'hover:bg-secondary-100 dark:hover:bg-secondary-800'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                  : 'space-y-6'
              }
            >
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn btn-primary transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
                >
                  {loadingMore ? t('common.loading') : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
              {t('properties.noResults')}
            </h3>
            <p className="text-secondary-500 mb-6">Try adjusting your search filters</p>
            <button onClick={clearFilters} className="btn btn-primary transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
