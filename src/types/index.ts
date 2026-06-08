export type Language = 'en' | 'uk' | 'ru' | 'fr' | 'ar';

export type Theme = 'light' | 'dark';

export type PropertyType = 'house' | 'apartment' | 'villa' | 'penthouse';

export type PropertyStatus = 'for_sale' | 'sold' | 'rented';

export type AreaUnit = 'sqm' | 'sqft';

export type InquiryStatus = 'new' | 'read' | 'replied';

export type PreferredContact = 'email' | 'whatsapp' | 'telegram';

export interface MultilingualText {
  en: string;
  uk: string;
  ru: string;
  fr: string;
  ar: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  sort_order: number;
  is_thumbnail: boolean;
}

export interface Property {
  id: string;
  title: MultilingualText;
  description: MultilingualText;
  price: number;
  currency: string;
  location: string;
  address: string | null;
  city?: string | null;
  country?: string | null;
  full_address?: string | null;
  property_type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  area_size: number;
  area_unit?: AreaUnit;
  features: string[];
  images: string[]; // legacy; will be replaced by property_images progressively
  thumbnail_url?: string | null;
  video_url: string | null;
  is_featured: boolean;
  year_built?: number | null;
  parking_spaces?: number | null;
  has_pool?: boolean;
  has_garden?: boolean;
  map_lat?: number | null;
  map_lng?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyInquiry {
  id: string;
  property_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  preferred_contact: PreferredContact;
  status: InquiryStatus;
  created_at: string;
  property?: Property;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}
