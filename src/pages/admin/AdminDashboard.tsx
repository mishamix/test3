import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../contexts/AppContext';
import BrandLogo from '../../components/BrandLogo';

export default function AdminDashboard() {
  const { t } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/login');
      } else {
        setUser(user);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard, exact: true },
    { to: '/admin/properties', label: t('admin.manageProperties'), icon: Home },
    { to: '/admin/inquiries', label: t('admin.manageInquiries'), icon: MessageSquare },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-secondary-100 dark:bg-secondary-950">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2 min-w-0">
            <BrandLogo className="h-10 w-auto max-w-[140px] md:h-[50px]" />
            <span className="font-display text-lg font-bold text-secondary-900 dark:text-white shrink-0">
              Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-secondary-700 dark:text-secondary-300" />
            ) : (
              <Menu className="w-6 h-6 text-secondary-700 dark:text-secondary-300" />
            )}
          </button>
        </div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-700 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-3 p-6 border-b border-secondary-200 dark:border-secondary-700 min-w-0">
            <BrandLogo className="h-10 w-auto max-w-[180px] md:h-[50px] lg:h-[55px]" />
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(to, exact)
                    ? 'bg-luxury-gold text-white'
                    : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary-100 dark:bg-secondary-800 mb-3">
              <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-luxury-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-secondary-900 dark:text-white truncate">
                  {user?.email}
                </div>
                <div className="text-xs text-secondary-500">Admin</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
