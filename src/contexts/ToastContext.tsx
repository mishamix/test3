import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type ToastTone = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  tone: ToastTone;
  title: string;
  message?: string;
};

type ToastContextType = {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID();
      const item: ToastItem = { id, ...toast };
      setToasts((prev) => [item, ...prev].slice(0, 4));
      window.setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const value = useMemo(() => ({ toasts, push, remove }), [toasts, push, remove]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');

  return {
    push: ctx.push,
    remove: ctx.remove,
    success: (title: string, message?: string) => ctx.push({ tone: 'success', title, message }),
    error: (title: string, message?: string) => ctx.push({ tone: 'error', title, message }),
    info: (title: string, message?: string) => ctx.push({ tone: 'info', title, message }),
    toasts: ctx.toasts,
  };
}

