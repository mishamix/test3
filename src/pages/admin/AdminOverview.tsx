import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, MessageSquare, TrendingUp, DollarSign, Eye, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../contexts/AppContext';
import Loading from '../../components/Loading';

interface DashboardStats {
  totalProperties: number;
  totalInquiries: number;
  totalValue: number;
  newInquiries: number;
}

export default function AdminOverview() {
  const { t } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    totalInquiries: 0,
    totalValue: 0,
    newInquiries: 0,
  });
  const [teleporterSelection, setTeleporterSelection] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [propertiesResult, inquiriesResult, newInquiriesResult] = await Promise.all([
          supabase.from('properties').select('price, status'),
          supabase.from('property_inquiries').select('id'),
          supabase.from('property_inquiries').select('id').eq('status', 'new'),
        ]);

        const totalValue = (propertiesResult.data || [])
          .filter((p) => p.status === 'for_sale')
          .reduce((sum, p) => sum + Number(p.price), 0);

        setStats({
          totalProperties: propertiesResult.data?.length || 0,
          totalInquiries: inquiriesResult.data?.length || 0,
          totalValue,
          newInquiries: newInquiriesResult.data?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: Building2,
      color: 'bg-luxury-gold/10 text-luxury-gold',
    },
    {
      title: 'Total Inquiries',
      value: stats.totalInquiries,
      icon: MessageSquare,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'New Inquiries',
      value: stats.newInquiries,
      badge: true,
      icon: Eye,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      title: 'Portfolio Value',
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            {t('admin.dashboard')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Overview of your real estate business
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={teleporterSelection}
            onChange={(e) => {
              const to = e.target.value;
              setTeleporterSelection('');
              if (to) navigate(to);
            }}
            aria-label={t('admin.teleporter')}
            className="w-full sm:w-56 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-xl px-3 py-2 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-luxury-gold"
          >
            <option value="">{t('admin.teleporter')}</option>
            <option value="/admin">{t('admin.dashboard')}</option>
            <option value="/admin/properties/new">{t('admin.addProperty')}</option>
            <option value="/admin/properties">{t('admin.manageProperties')}</option>
            <option value="/admin/inquiries">{t('admin.manageInquiries')}</option>
          </select>

          <Link to="/admin/properties/new" className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            {t('admin.addProperty')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                  {stat.value}
                  {stat.badge && stats.newInquiries > 0 && (
                    <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="space-y-3">
            <Link
              to="/admin/properties/new"
              className="flex items-center gap-3 p-4 rounded-lg bg-luxury-gold/5 hover:bg-luxury-gold/10 dark:hover:bg-luxury-gold/20 transition-colors"
            >
              <Plus className="w-5 h-5 text-luxury-gold" />
              <span className="text-secondary-900 dark:text-white">{t('admin.addProperty')}</span>
            </Link>
            <Link
              to="/admin/properties"
              className="flex items-center gap-3 p-4 rounded-lg bg-secondary-50 dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <Building2 className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              <span className="text-secondary-900 dark:text-white">{t('admin.manageProperties')}</span>
            </Link>
            <Link
              to="/admin/inquiries"
              className="flex items-center gap-3 p-4 rounded-lg bg-secondary-50 dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              <span className="text-secondary-900 dark:text-white">{t('admin.manageInquiries')}</span>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-secondary-300 dark:text-secondary-700 mx-auto mb-3" />
            <p className="text-secondary-600 dark:text-secondary-400">
              View recent property views and inquiries here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
