import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import {
  buildSearchOrFilter,
  groupGalleryRows,
  normalizeProperty,
} from '../lib/propertyUtils';
import { Property, PropertyInquiry } from '../types';

type PropertyRow = Record<string, unknown> & {
  id: string;
  images?: string[] | null;
  thumbnail_url?: string | null;
};

export interface PropertyFilters {
  search?: string;
  propertyType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  featured?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc';
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 12;

function filtersToKey(filters?: PropertyFilters): string {
  return JSON.stringify(filters ?? {});
}

function logSupabaseError(context: string, error: unknown) {
  if (error && typeof error === 'object') {
    const e = error as { message?: string; code?: string; details?: string; hint?: string };
    console.error('[Supabase]', context, {
      message: e.message ?? String(error),
      code: e.code ?? null,
      details: e.details ?? null,
      hint: e.hint ?? null,
    });
    return;
  }
  console.error('[Supabase]', context, error);
}

async function attachGalleryImages(rows: PropertyRow[]): Promise<Property[]> {
  if (rows.length === 0) return [];

  const propertyIds = rows.map((row) => row.id);
  const { data: imageRows, error: imagesError } = await supabase
    .from('property_images')
    .select('property_id, image_url, sort_order, is_thumbnail')
    .in('property_id', propertyIds)
    .order('sort_order', { ascending: true });

  if (imagesError) {
    logSupabaseError('property_images batch select', imagesError);
  }

  const galleryByProperty = groupGalleryRows(imageRows ?? []);
  return rows.map((row) => normalizeProperty(row, galleryByProperty.get(row.id)));
}

async function fetchPropertiesFromSupabase(filters?: PropertyFilters) {
  const page = filters?.page ?? 0;
  const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  console.log('[Properties] fetch start', { filters, from, to });

  let query = supabase.from('properties').select('*', { count: 'exact' });

  const searchOr = filters?.search ? buildSearchOrFilter(filters.search) : '';
  if (searchOr) {
    console.log('[Property Search] applying filter', { search: filters?.search, searchOr });
    query = query.or(searchOr);
  }

  if (filters?.propertyType && filters.propertyType !== 'all') {
    query = query.eq('property_type', filters.propertyType);
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  if (filters?.minBedrooms !== undefined && filters.minBedrooms > 0) {
    query = query.gte('bedrooms', filters.minBedrooms);
  }

  if (filters?.minBathrooms !== undefined && filters.minBathrooms > 0) {
    query = query.gte('bathrooms', filters.minBathrooms);
  }

  if (filters?.featured) {
    query = query.eq('is_featured', true);
  }

  switch (filters?.sortBy) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    logSupabaseError('properties select', error);
    throw error;
  }

  console.log('[Properties] fetch response', {
    count: data?.length ?? 0,
    total: count ?? null,
  });

  const properties = await attachGalleryImages((data ?? []) as PropertyRow[]);
  const total = count ?? properties.length;
  const hasMore = to + 1 < total;

  return { properties, total, hasMore };
}

export function useProperties(filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const filterKey = filtersToKey(filters);
  const requestIdRef = useRef(0);
  const pageRef = useRef(0);

  const fetchProperties = useCallback(
    async (append = false) => {
      const requestId = ++requestIdRef.current;
      if (append) {
        setLoadingMore(true);
      } else {
        pageRef.current = 0;
        setLoading(true);
      }
      setError(null);

      try {
        const parsedFilters = JSON.parse(filterKey) as PropertyFilters;
        const page = append ? pageRef.current + 1 : 0;
        const result = await fetchPropertiesFromSupabase({
          ...parsedFilters,
          page,
        });

        if (requestId !== requestIdRef.current) return;

        if (append) {
          pageRef.current = page;
        } else {
          pageRef.current = 0;
        }

        setProperties((prev) => (append ? [...prev, ...result.properties] : result.properties));
        setHasMore(result.hasMore);
        setTotal(result.total);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [filterKey]
  );

  useEffect(() => {
    fetchProperties(false);
  }, [fetchProperties]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    await fetchProperties(true);
  }, [fetchProperties, hasMore, loadingMore]);

  return {
    properties,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    refetch: () => fetchProperties(false),
    loadMore,
  };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProperty = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      console.log('[Property Details] fetch start', { id });

      try {
        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) {
          logSupabaseError('property select by id', fetchError);
          throw fetchError;
        }

        if (!data) {
          console.log('[Property Details] not found', { id });
          if (!cancelled) setProperty(null);
          return;
        }

        const { data: imageRows, error: imagesError } = await supabase
          .from('property_images')
          .select('property_id, image_url, sort_order, is_thumbnail')
          .eq('property_id', id)
          .order('sort_order', { ascending: true });

        if (imagesError) {
          logSupabaseError('property_images select by property_id', imagesError);
        }

        const normalized = normalizeProperty(data, imageRows ?? []);
        console.log('[Property Details] fetch success', {
          id,
          imagesCount: normalized.images.length,
          thumbnail: normalized.thumbnail_url,
        });

        if (!cancelled) setProperty(normalized);
      } catch (err) {
        console.error('[Property Details] fetch failed', err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setProperty(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProperty();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { property, loading, error };
}

export function useFeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      console.log('[Properties] fetch featured start');
      try {
        const { data, error: fetchError } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'for_sale')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (fetchError) {
          logSupabaseError('featured properties select', fetchError);
          throw fetchError;
        }

        const normalized = await attachGalleryImages((data ?? []) as PropertyRow[]);
        console.log('[Properties] fetch featured success', { count: normalized.length });
        setProperties(normalized);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { properties, loading, error };
}

export function useInquiries() {
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('property_inquiries')
        .select(`
          *,
          properties:property_id (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setInquiries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const updateInquiryStatus = async (id: string, status: 'new' | 'read' | 'replied') => {
    const { error: updateError } = await supabase
      .from('property_inquiries')
      .update({ status })
      .eq('id', id);

    if (updateError) throw updateError;

    await fetchInquiries();
  };

  return { inquiries, loading, error, refetch: fetchInquiries, updateInquiryStatus };
}
