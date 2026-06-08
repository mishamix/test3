import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Save, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../contexts/AppContext';
import { Language, MultilingualText } from '../../types';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { useToast } from '../../contexts/ToastContext';

const LANGUAGES: Language[] = ['en', 'uk', 'ru', 'fr', 'ar'];

const trimSafe = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const defaultMultilingualText = (): MultilingualText => ({
  en: '',
  uk: '',
  ru: '',
  fr: '',
  ar: '',
});

const normalizeMultilingualText = (raw: unknown): MultilingualText => {
  const normalized = defaultMultilingualText();
  if (raw && typeof raw === 'object') {
    for (const lang of LANGUAGES) {
      const val = (raw as Record<string, unknown>)[lang];
      normalized[lang] = typeof val === 'string' ? val : '';
    }
  }
  return normalized;
};

const isImageFile = (file: File): boolean =>
  file.type.startsWith('image/') ||
  /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i.test(file.name);

const createInitialFormData = () => ({
  title: defaultMultilingualText(),
  description: defaultMultilingualText(),
  price: '',
  currency: 'USD',
  location: '',
  address: '',
  property_type: 'house',
  status: 'for_sale',
  bedrooms: '',
  bathrooms: '',
  area_size: '',
  area_unit: 'sqft',
  city: '',
  country: '',
  full_address: '',
  thumbnail_url: '',
  features: [] as string[],
  images: [] as string[],
  video_url: '',
  is_featured: false,
  year_built: '',
  parking_spaces: '',
  has_pool: false,
  has_garden: false,
  map_lat: '',
  map_lng: '',
});

const logSupabaseError = (context: string, error: unknown) => {
  if (error && typeof error === 'object') {
    const e = error as { message?: string; code?: string; details?: string; hint?: string };
    console.error('[Supabase Error]', context, {
      message: e.message ?? String(error),
      code: e.code ?? null,
      details: e.details ?? null,
      hint: e.hint ?? null,
    });
    return;
  }
  console.error('[Supabase Error]', context, error);
};

export default function AdminPropertyForm() {
  const { t } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languages = LANGUAGES;

  const [formData, setFormData] = useState(createInitialFormData);

  const [newFeature, setNewFeature] = useState('');
  const [newImage, setNewImage] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingPreviews = useMemo(
    () => pendingFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [pendingFiles]
  );

  useEffect(() => {
    return () => {
      pendingPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [pendingPreviews]);

  useEffect(() => {
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (data) {
        let images = Array.isArray(data.images) ? data.images : [];
        let thumbnailUrl = data.thumbnail_url || '';

        const { data: imageRows, error: imagesFetchError } = await supabase
          .from('property_images')
          .select('image_url, sort_order, is_thumbnail')
          .eq('property_id', id)
          .order('sort_order', { ascending: true });

        if (imagesFetchError) {
          logSupabaseError('property_images select', imagesFetchError);
        } else if (imageRows && imageRows.length > 0) {
          images = imageRows.map((row) => row.image_url);
          const thumbRow = imageRows.find((row) => row.is_thumbnail);
          thumbnailUrl = thumbRow?.image_url || images[0] || thumbnailUrl;
        }

        setFormData({
          title: normalizeMultilingualText(data.title),
          description: normalizeMultilingualText(data.description),
          price: data.price != null ? String(data.price) : '',
          currency: data.currency || 'USD',
          location: data.location || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || '',
          full_address: data.full_address || '',
          thumbnail_url: thumbnailUrl,
          property_type: data.property_type || 'house',
          status: data.status || 'for_sale',
          bedrooms: data.bedrooms != null ? String(data.bedrooms) : '',
          bathrooms: data.bathrooms != null ? String(data.bathrooms) : '',
          area_size: data.area_size != null ? String(data.area_size) : '',
          area_unit: data.area_unit || 'sqft',
          features: Array.isArray(data.features) ? data.features : [],
          images,
          video_url: data.video_url || '',
          is_featured: Boolean(data.is_featured),
          year_built: data.year_built != null ? String(data.year_built) : '',
          parking_spaces: data.parking_spaces != null ? String(data.parking_spaces) : '',
          has_pool: Boolean(data.has_pool),
          has_garden: Boolean(data.has_garden),
          map_lat: data.map_lat != null ? String(data.map_lat) : '',
          map_lng: data.map_lng != null ? String(data.map_lng) : '',
        });
      }
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (lang: Language, value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: { ...normalizeMultilingualText(prev.title), [lang]: value ?? '' },
    }));
  };

  const handleDescriptionChange = (lang: Language, value: string) => {
    setFormData((prev) => ({
      ...prev,
      description: { ...normalizeMultilingualText(prev.description), [lang]: value ?? '' },
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (value ?? ''),
    }));
  };

  const addFeature = () => {
    const feature = trimSafe(newFeature);
    if (feature) {
      setFormData((prev) => ({ ...prev, features: [...prev.features, feature] }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addImage = () => {
    const imageUrl = trimSafe(newImage);
    if (imageUrl) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, imageUrl] }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= formData.images.length) return;
    setFormData((prev) => {
      const next = [...prev.images];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...prev, images: next };
    });
  };

  const movePending = (from: number, to: number) => {
    if (to < 0 || to >= pendingFiles.length) return;
    setPendingFiles((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const onFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next = Array.from(files).filter(isImageFile);
    console.log('[Image Upload] files selected', {
      total: files.length,
      accepted: next.length,
      names: next.map((f) => f.name),
      types: next.map((f) => f.type || '(empty)'),
    });
    if (next.length === 0) {
      toast.error('Invalid files', 'Please select image files (JPG, PNG, WebP, etc.).');
      return;
    }
    setPendingFiles((prev) => [...prev, ...next]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const normalizeVideoUrl = (raw: string): string => {
    const url = trimSafe(raw);
    if (!url) return '';

    try {
      const u = new URL(url);
      const host = u.hostname.replace('www.', '');

      // YouTube
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
        if (u.pathname.startsWith('/embed/')) return url;
      }
      if (host === 'youtu.be') {
        const id = u.pathname.split('/').filter(Boolean)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }

      // Vimeo
      if (host === 'vimeo.com') {
        const id = u.pathname.split('/').filter(Boolean)[0];
        if (id) return `https://player.vimeo.com/video/${id}`;
      }
      if (host === 'player.vimeo.com' && u.pathname.startsWith('/video/')) {
        return url;
      }
    } catch {
      // ignore parse errors
    }

    return url;
  };

  const uploadPendingImages = async (propertyId: string): Promise<string[]> => {
    if (pendingFiles.length === 0) {
      console.log('[Image Upload] no pending files, skipping upload');
      return [];
    }

    console.log('[Image Upload] starting', { propertyId, fileCount: pendingFiles.length });

    const { data: userResult, error: userError } = await supabase.auth.getUser();
    console.log('[Image Upload] auth.getUser', {
      userId: userResult.user?.id ?? null,
      error: userError?.message ?? null,
    });
    if (!userResult.user || userError) {
      logSupabaseError('auth.getUser during image upload', userError);
      throw new Error('Not authenticated. Please log in again.');
    }

    const { data: bucketList, error: bucketListError } = await supabase.storage
      .from('property-images')
      .list('', { limit: 1 });
    console.log('[Image Upload] bucket preflight', {
      accessible: !bucketListError,
      bucketList,
      error: bucketListError?.message ?? null,
    });
    if (bucketListError) {
      logSupabaseError('storage bucket preflight', bucketListError);
      toast.error('Image upload setup issue', `Bucket "property-images" not accessible: ${bucketListError.message}`);
      throw new Error(
        `Storage bucket "property-images" is not accessible: ${bucketListError.message}. Check bucket exists and policies allow uploads for admins.`
      );
    }

    const uuid =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? () => crypto.randomUUID()
        : () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const uploadedUrls: string[] = [];
    for (const file of pendingFiles) {
      const ext = file.name.split('.').pop() || 'png';
      const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
      const path = `${propertyId}/${uuid()}.${safeExt}`;

      console.log('[Image Upload] uploading', {
        propertyId,
        path,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || undefined,
        });

      console.log('[Image Upload] upload response', {
        path,
        uploadData,
        error: uploadError?.message ?? null,
      });
      if (uploadError) {
        logSupabaseError(`storage upload ${path}`, uploadError);
        throw uploadError;
      }

      const { data: publicUrl } = supabase.storage.from('property-images').getPublicUrl(path);
      console.log('[Image Upload] getPublicUrl', { path, publicUrl: publicUrl?.publicUrl ?? null });

      if (!publicUrl?.publicUrl) {
        throw new Error(
          'Failed to resolve a public URL for the uploaded image. Ensure the bucket "property-images" is set to Public.'
        );
      }

      uploadedUrls.push(publicUrl.publicUrl);
    }

    console.log('[Image Upload] complete', { propertyId, uploadedCount: uploadedUrls.length, urls: uploadedUrls });
    return uploadedUrls;
  };

  const syncPropertyImagesTable = async (propertyId: string, urls: string[]) => {
    const { error: deleteError } = await supabase.from('property_images').delete().eq('property_id', propertyId);
    console.log('[Image Upload] property_images delete', { propertyId, error: deleteError?.message ?? null });
    if (deleteError) {
      logSupabaseError('property_images delete', deleteError);
      throw deleteError;
    }

    if (urls.length === 0) return;
    const rows = urls.map((imageUrl, idx) => ({
      property_id: propertyId,
      image_url: imageUrl,
      sort_order: idx,
      is_thumbnail: idx === 0,
    }));

    const { data: insertData, error: insertError } = await supabase.from('property_images').insert(rows).select('id');
    console.log('[Image Upload] property_images insert', {
      propertyId,
      rowCount: rows.length,
      inserted: insertData?.length ?? 0,
      error: insertError?.message ?? null,
    });
    if (insertError) {
      logSupabaseError('property_images insert', insertError);
      throw insertError;
    }
  };

  const validate = () => {
    const enTitle = trimSafe(formData.title?.en);
    const city = trimSafe(formData.city);
    const country = trimSafe(formData.country);
    const price = Number(formData.price);

    console.log('[Validate]', { enTitle, city, country, price, pendingFiles: pendingFiles.length });

    if (!enTitle) {
      setError('English title is required');
      console.log('[Validate] failed: English title is required');
      return false;
    }
    if (!city || !country) {
      setError('City and country are required');
      console.log('[Validate] failed: City and country are required');
      return false;
    }
    if (!formData.price || Number.isNaN(price) || price <= 0) {
      setError('Valid price is required');
      console.log('[Validate] failed: Valid price is required');
      return false;
    }

    console.log('[Validate] passed');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError(null);

    try {
      const city = trimSafe(formData.city);
      const country = trimSafe(formData.country);
      const displayLocation =
        trimSafe(formData.location) || (city && country ? `${city}, ${country}` : city || country);

      const propertyData = {
        title: normalizeMultilingualText(formData.title),
        description: normalizeMultilingualText(formData.description),
        price: Number(formData.price),
        currency: formData.currency || 'USD',
        location: displayLocation,
        address: trimSafe(formData.address) || null,
        city: city || null,
        country: country || null,
        full_address: trimSafe(formData.full_address) || null,
        thumbnail_url: trimSafe(formData.thumbnail_url) || null,
        property_type: formData.property_type || 'house',
        status: formData.status || 'for_sale',
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : 0,
        area_size: formData.area_size ? Number(formData.area_size) : 0,
        area_unit: formData.area_unit || 'sqft',
        features: formData.features ?? [],
        images: formData.images ?? [],
        video_url: trimSafe(formData.video_url) ? normalizeVideoUrl(formData.video_url) : null,
        is_featured: Boolean(formData.is_featured),
        year_built: formData.year_built ? Number(formData.year_built) : null,
        parking_spaces: formData.parking_spaces ? Number(formData.parking_spaces) : null,
        has_pool: Boolean(formData.has_pool),
        has_garden: Boolean(formData.has_garden),
        map_lat: formData.map_lat ? Number(formData.map_lat) : null,
        map_lng: formData.map_lng ? Number(formData.map_lng) : null,
      };

      console.log('[Property Save] payload', { isEdit, propertyData });

      let propertyId = id as string | undefined;

      if (isEdit) {
        const { data: updateData, error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', id)
          .select('id')
          .single();

        console.log('[Property Save] update response', { updateData, error: updateError?.message ?? null });
        if (updateError) {
          logSupabaseError('properties update', updateError);
          throw updateError;
        }
        propertyId = updateData?.id ?? id;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('properties')
          .insert([propertyData])
          .select('id')
          .single();

        console.log('[Property Save] insert response', { inserted, error: insertError?.message ?? null });
        if (insertError) {
          logSupabaseError('properties insert', insertError);
          throw insertError;
        }
        propertyId = inserted?.id;
      }

      if (!propertyId) {
        throw new Error('Property saved but no ID was returned. Check RLS policies allow SELECT after INSERT.');
      }

      console.log('[Property Save] property id', propertyId);

      const uploaded = await uploadPendingImages(propertyId);
      const merged = [...(formData.images ?? []), ...uploaded];

      const thumbnailUrl = merged[0] || trimSafe(formData.thumbnail_url) || null;
      const { data: updateImagesData, error: imagesUpdateError } = await supabase
        .from('properties')
        .update({ images: merged, thumbnail_url: thumbnailUrl })
        .eq('id', propertyId)
        .select('id, images, thumbnail_url')
        .single();

      console.log('[Property Save] images update', {
        propertyId,
        imagesCount: merged.length,
        thumbnailUrl,
        updateImagesData,
        error: imagesUpdateError?.message ?? null,
      });
      if (imagesUpdateError) {
        logSupabaseError('properties images update', imagesUpdateError);
        throw imagesUpdateError;
      }

      await syncPropertyImagesTable(propertyId, merged);

      setFormData((prev) => ({
        ...prev,
        images: merged,
        thumbnail_url: thumbnailUrl || prev.thumbnail_url,
      }));
      setPendingFiles([]);

      console.log('[Property Save] success', { propertyId, imagesCount: merged.length });
      navigate('/admin/properties');
      toast.success('Saved', isEdit ? 'Property updated successfully.' : 'Property created successfully.');
    } catch (err) {
      logSupabaseError('handleSubmit', err);
      console.error('[Property Save] failed', err);
      setError(err instanceof Error ? err.message : 'Failed to save property');
      toast.error('Save failed', err instanceof Error ? err.message : 'Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/admin/properties')}
        className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:text-luxury-gold mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Properties
      </button>

      <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-6">
          {isEdit ? t('admin.editProperty') : t('admin.addProperty')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Property Titles (Multilingual)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages.map((lang) => (
                <Input
                  key={lang}
                  label={`Title (${lang.toUpperCase()})${lang === 'en' ? ' *' : ''}`}
                  value={formData.title[lang] ?? ''}
                  onChange={(e) => handleTitleChange(lang, e.target.value)}
                  placeholder={`Property title in ${lang.toUpperCase()}`}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Descriptions (Multilingual)
            </h2>
            <div className="space-y-4">
              {languages.map((lang) => (
                <Textarea
                  key={lang}
                  label={`Description (${lang.toUpperCase()})`}
                  value={formData.description[lang] ?? ''}
                  onChange={(e) => handleDescriptionChange(lang, e.target.value)}
                  placeholder={`Detailed description in ${lang.toUpperCase()}`}
                  rows={3}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              name="price"
              type="number"
              label="Price *"
              value={formData.price}
              onChange={handleChange}
              placeholder="500000"
              required
            />
            <Select
              name="currency"
              label="Currency"
              value={formData.currency}
              onChange={handleChange}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'AED', label: 'AED' },
              ]}
            />
            <Input
              name="city"
              label="City *"
              value={formData.city}
              onChange={handleChange}
              placeholder="Cotswolds"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              name="country"
              label="Country *"
              value={formData.country}
              onChange={handleChange}
              placeholder="United Kingdom"
              required
            />
            <Input
              name="location"
              label="Display Location (optional)"
              value={formData.location}
              onChange={handleChange}
              placeholder="Cotswolds, UK"
            />
            <Input
              name="thumbnail_url"
              label="Main Thumbnail URL (optional)"
              value={formData.thumbnail_url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <Input
            name="full_address"
            label="Full Address"
            value={formData.full_address}
            onChange={handleChange}
            placeholder="Street, City, ZIP"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Select
              name="property_type"
              label="Property Type"
              value={formData.property_type}
              onChange={handleChange}
              options={[
                { value: 'house', label: 'House' },
                { value: 'apartment', label: 'Apartment' },
                { value: 'villa', label: 'Villa' },
                { value: 'penthouse', label: 'Penthouse' },
              ]}
            />
            <Select
              name="status"
              label="Status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'for_sale', label: 'For Sale' },
                { value: 'sold', label: 'Sold' },
                { value: 'rented', label: 'Rented' },
              ]}
            />
            <Input
              name="bedrooms"
              type="number"
              label="Bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              placeholder="4"
            />
            <Input
              name="bathrooms"
              type="number"
              label="Bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              placeholder="3"
            />
          </div>

          <Input
            name="area_size"
            type="number"
            label="Area Size"
            value={formData.area_size}
            onChange={handleChange}
            placeholder="5000"
          />

          <Select
            name="area_unit"
            label="Area Unit"
            value={formData.area_unit}
            onChange={handleChange}
            options={[
              { value: 'sqft', label: 'sq ft' },
              { value: 'sqm', label: 'm²' },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="year_built"
              type="number"
              label="Year Built (optional)"
              value={formData.year_built}
              onChange={handleChange}
              placeholder="2021"
            />
            <Input
              name="parking_spaces"
              type="number"
              label="Parking Spaces (optional)"
              value={formData.parking_spaces}
              onChange={handleChange}
              placeholder="2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="has_pool"
                name="has_pool"
                checked={formData.has_pool}
                onChange={handleChange}
                className="w-5 h-5 rounded border-secondary-300 text-luxury-gold focus:ring-luxury-gold"
              />
              <label htmlFor="has_pool" className="text-secondary-900 dark:text-white">
                Swimming pool
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="has_garden"
                name="has_garden"
                checked={formData.has_garden}
                onChange={handleChange}
                className="w-5 h-5 rounded border-secondary-300 text-luxury-gold focus:ring-luxury-gold"
              />
              <label htmlFor="has_garden" className="text-secondary-900 dark:text-white">
                Garden
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="map_lat"
              type="number"
              label="Map Latitude (optional)"
              value={formData.map_lat}
              onChange={handleChange}
              placeholder="51.5072"
            />
            <Input
              name="map_lng"
              type="number"
              label="Map Longitude (optional)"
              value={formData.map_lng}
              onChange={handleChange}
              placeholder="-0.1276"
            />
          </div>

          <div>
            <label className="label">Features</label>
            <div className="flex gap-2 mb-3">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Swimming Pool"
                className="flex-1"
              />
              <button type="button" onClick={addFeature} className="btn btn-primary">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-luxury-gold/10 text-secondary-900 dark:text-white"
                >
                  {feature}
                  <button type="button" onClick={() => removeFeature(index)}>
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="label">{t('admin.images')}</label>
            <div className="flex gap-2 mb-3">
              <Input
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              <button type="button" onClick={addImage} className="btn btn-primary">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onFilesSelected(e.target.files)}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFilesSelected(e.dataTransfer.files);
                }}
                className="rounded-xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 bg-secondary-50/70 dark:bg-secondary-800/40 p-6 text-center cursor-pointer hover:border-luxury-gold/70 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-luxury-gold" />
                </div>
                <p className="text-sm text-secondary-700 dark:text-secondary-300">
                  Drag & drop images here, or click to upload
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                  Uploads to Supabase Storage on save
                </p>
              </div>
            </div>

            {pendingPreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-secondary-800 dark:text-secondary-200 mb-2">
                  Pending uploads
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pendingPreviews.map((p, index) => (
                    <div key={`${p.file.name}-${index}`} className="relative aspect-video rounded-lg overflow-hidden group">
                      <img src={p.url} alt={p.file.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => movePending(index, index - 1)}
                          className="p-1.5 rounded bg-black/60 text-white"
                          aria-label="Move up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => movePending(index, index + 1)}
                          className="p-1.5 rounded bg-black/60 text-white"
                          aria-label="Move down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePendingFile(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden group">
                  <img src={image} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="p-1.5 rounded bg-black/60 text-white"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="p-1.5 rounded bg-black/60 text-white"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Input
            name="video_url"
            label="Video URL (YouTube/Vimeo)"
            value={formData.video_url}
            onChange={handleChange}
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
          />

          {trimSafe(formData.video_url) && (
            <div className="rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700">
              <div className="px-4 py-3 text-sm font-medium text-secondary-800 dark:text-secondary-200 border-b border-secondary-200 dark:border-secondary-700">
                Video preview
              </div>
              <div className="aspect-video">
                <iframe
                  src={normalizeVideoUrl(formData.video_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Property video preview"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-5 h-5 rounded border-secondary-300 text-luxury-gold focus:ring-luxury-gold"
            />
            <label htmlFor="is_featured" className="text-secondary-900 dark:text-white">
              Mark as top property on homepage
            </label>
          </div>

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/properties')}
              className="btn btn-ghost"
            >
              {t('common.cancel')}
            </button>
            <Button type="submit" loading={saving}>
              <Save className="w-5 h-5 mr-2" />
              {t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
