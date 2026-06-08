import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Home, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../contexts/AppContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BrandLogo from '../../components/BrandLogo';

export default function AdminLoginPage() {
  const { t } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        }
        throw signInError;
      }

      if (data.user) {
        console.log('[AdminLogin] signed in', { userId: data.user.id, email: data.user.email });
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id, auth_user_id, email')
          .eq('auth_user_id', data.user.id)
          .maybeSingle();

        console.log('[AdminLogin] admin_users lookup', {
          userId: data.user.id,
          adminData,
          error: adminError?.message ?? null,
        });

        if (adminError) throw adminError;

        if (adminData) {
          navigate('/admin');
        } else {
          await supabase.auth.signOut();
          throw new Error('Access denied. You are not authorized as an admin.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-cream dark:bg-secondary-950 px-4">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50 inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-[#f8f2e8]/90 dark:bg-secondary-900/80 px-3 py-2 sm:px-4 sm:py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-200 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-yellow-500/50 hover:text-secondary-900 dark:hover:text-white"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-luxury-gold/20 text-luxury-gold">
          <Home className="h-3.5 w-3.5" />
        </span>
        <span>{t('nav.home')}</span>
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo
            loading="eager"
            className="h-10 w-auto max-w-[min(80vw,280px)] mx-auto mb-4 md:h-[50px] lg:h-[55px]"
          />
          <h1 className="font-display text-3xl font-bold text-secondary-900 dark:text-white mb-2">
            {t('admin.title')}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Sign in to manage your properties
          </p>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="email"
              name="email"
              label={t('admin.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@luxuryestates.com"
              required
            />

            <Input
              type="password"
              name="password"
              label={t('admin.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              <Lock className="w-5 h-5 mr-2" />
              {t('admin.login')}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-secondary-200 dark:border-secondary-700 text-center">
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Demo credentials for testing:
            </p>
            <p className="text-sm text-secondary-500 dark:text-secondary-500 mt-1">
              Email: admin@luxuryestates.com<br />
              Password: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
