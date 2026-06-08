import { Property, PropertyImage, MultilingualText, Language } from '../types';

export const FALLBACK_PROPERTY_IMAGE =
  'https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

const LANGUAGES: Language[] = ['en', 'uk', 'ru', 'fr', 'ar'];

export function normalizeMultilingualText(raw: unknown): MultilingualText {
  const normalized: MultilingualText = { en: '', uk: '', ru: '', fr: '', ar: '' };
  if (raw && typeof raw === 'object') {
    for (const lang of LANGUAGES) {
      const val = (raw as Record<string, unknown>)[lang];
      normalized[lang] = typeof val === 'string' ? val : '';
    }
  }
  return normalized;
}

type PropertyRow = Record<string, unknown> & {
  id: string;
  images?: string[] | null;
  thumbnail_url?: string | null;
};

type ImageRow = Pick<PropertyImage, 'property_id' | 'image_url' | 'sort_order' | 'is_thumbnail'>;

export function mergeGalleryImages(
  propertyImages: string[] | null | undefined,
  galleryRows: ImageRow[] | null | undefined
): string[] {
  const fromTable = (galleryRows ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => row.image_url)
    .filter(Boolean);

  if (fromTable.length > 0) return fromTable;

  const legacy = Array.isArray(propertyImages) ? propertyImages.filter(Boolean) : [];
  return legacy;
}

export function getThumbnailUrl(
  thumbnailUrl: string | null | undefined,
  gallery: string[]
): string {
  if (thumbnailUrl) return thumbnailUrl;
  if (gallery[0]) return gallery[0];
  return FALLBACK_PROPERTY_IMAGE;
}

export function normalizeProperty(row: PropertyRow, galleryRows?: ImageRow[]): Property {
  const images = mergeGalleryImages(row.images as string[] | null, galleryRows);
  const thumbnail_url = getThumbnailUrl(row.thumbnail_url as string | null, images);

  return {
    ...(row as unknown as Property),
    title: normalizeMultilingualText(row.title),
    description: normalizeMultilingualText(row.description),
    images: images.length > 0 ? images : [FALLBACK_PROPERTY_IMAGE],
    thumbnail_url,
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
  };
}

export function groupGalleryRows(
  rows: ImageRow[] | null | undefined
): Map<string, ImageRow[]> {
  const map = new Map<string, ImageRow[]>();
  for (const row of rows ?? []) {
    const list = map.get(row.property_id) ?? [];
    list.push(row);
    map.set(row.property_id, list);
  }
  return map;
}

export function escapeIlikePattern(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '""').replace(/,/g, '');
}

export function buildSearchOrFilter(search: string): string {
  const trimmed = search.trim();
  if (!trimmed) return '';

  const pattern = `%${escapeIlikePattern(trimmed)}%`;
  return [
    `city.ilike."${pattern}"`,
    `country.ilike."${pattern}"`,
    `address.ilike."${pattern}"`,
    `full_address.ilike."${pattern}"`,
    `location.ilike."${pattern}"`,
    `title->>en.ilike."${pattern}"`,
  ].join(',');
}

export function getLocationLabel(property: Property): string {
  const cityCountry = [property.city, property.country].filter(Boolean).join(', ');
  return cityCountry || property.location || '';
}
