import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../contexts/AppContext';
import { Property, Language } from '../../types';
import Loading, { SkeletonCard } from '../../components/Loading';
import Modal from '../../components/Modal';
import { useToast } from '../../contexts/ToastContext';

export default function AdminProperties() {
  const { t, language } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; propertyId: string | null }>({
    open: false,
    propertyId: null,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.propertyId) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', deleteModal.propertyId);

      if (error) throw error;
      setProperties(properties.filter((p) => p.id !== deleteModal.propertyId));
      toast.success('Deleted', 'Property removed successfully.');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Delete failed', error instanceof Error ? error.message : 'Failed to delete property');
    } finally {
      setDeleteModal({ open: false, propertyId: null });
    }
  };

  const toggleFeatured = async (property: Property) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_featured: !property.is_featured })
        .eq('id', property.id);

      if (error) throw error;
      setProperties(
        properties.map((p) =>
          p.id === property.id ? { ...p, is_featured: !p.is_featured } : p
        )
      );
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const updateStatus = async (propertyId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', propertyId);

      if (error) throw error;
      setProperties(
        properties.map((p) =>
          p.id === propertyId ? { ...p, status: status as any } : p
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            {t('admin.manageProperties')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            {properties.length} properties total
          </p>
        </div>
        <Link to="/admin/properties/new" className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          {t('admin.addProperty')}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-secondary-400" />
          </div>
          <p className="text-secondary-700 dark:text-secondary-300 mb-6">
            No properties found. Add your first property to get started.
          </p>
          <Link to="/admin/properties/new" className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            {t('admin.addProperty')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const title = property.title[language as Language] || property.title.en;
            const mainImage = property.thumbnail_url || property.images[0];

            return (
              <div key={property.id} className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg overflow-hidden">
                <div className="relative aspect-video">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary-200 dark:bg-secondary-800 flex items-center justify-center">
                      <span className="text-secondary-400">No image</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {property.is_featured && (
                      <span className="px-2 py-1 text-xs bg-luxury-gold text-white rounded">
                        {t('admin.featured')}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded text-white ${
                        property.status === 'for_sale'
                          ? 'bg-green-500'
                          : property.status === 'sold'
                          ? 'bg-red-500'
                          : 'bg-yellow-500'
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-secondary-900 dark:text-white mb-2 line-clamp-2">
                    {title}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                    {property.location}
                  </p>
                  <p className="font-display font-semibold text-luxury-gold mb-4">
                    ${property.price.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/properties/${property.id}/edit`}
                      className="btn btn-ghost flex-1 text-sm py-2"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleFeatured(property)}
                      className={`btn flex-1 text-sm py-2 ${
                        property.is_featured ? 'btn-primary' : 'btn-ghost'
                      }`}
                    >
                      {property.is_featured ? <Check className="w-4 h-4 mr-1" /> : null}
                      {t('admin.featured')}
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, propertyId: property.id })}
                      className="btn btn-ghost text-red-600 py-2 px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, propertyId: null })}
        title={t('admin.deleteProperty')}
        size="sm"
      >
        <div className="py-4">
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            {t('admin.deleteConfirm')}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal({ open: false, propertyId: null })}
              className="btn btn-ghost flex-1"
            >
              {t('common.cancel')}
            </button>
            <button onClick={handleDelete} className="btn bg-red-600 hover:bg-red-700 text-white flex-1">
              {t('common.delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
