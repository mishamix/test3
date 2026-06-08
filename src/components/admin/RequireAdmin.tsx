import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Loading from '../Loading';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'authorized' } | { status: 'unauthorized' }
  >({ status: 'loading' });

  useEffect(() => {
    let isMounted = true;
    let checkSeq = 0;

    const check = async () => {
      const seq = ++checkSeq;
      if (isMounted) setState({ status: 'loading' });

      const { data: userResult, error: userError } = await supabase.auth.getUser();
      const user = userResult.user;

      console.log('[RequireAdmin] getUser', {
        seq,
        userId: user?.id ?? null,
        email: user?.email ?? null,
        error: userError?.message ?? null,
      });

      if (!user || userError) {
        if (isMounted && seq === checkSeq) setState({ status: 'unauthorized' });
        return;
      }

      const { data: adminRow, error: adminError } = await supabase
        .from('admin_users')
        .select('id, auth_user_id, email')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      console.log('[RequireAdmin] admin_users lookup', {
        seq,
        userId: user.id,
        adminRow,
        error: adminError?.message ?? null,
      });

      const authorized = Boolean(adminRow) && !adminError;
      console.log('[RequireAdmin] result', { seq, authorized });

      if (isMounted && seq === checkSeq) {
        setState({ status: authorized ? 'authorized' : 'unauthorized' });
      }
    };

    check();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      console.log('[RequireAdmin] onAuthStateChange', event);
      check();
    });
    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (state.status === 'loading') return <Loading />;
  if (state.status === 'unauthorized') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

