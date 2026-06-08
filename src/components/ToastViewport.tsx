import { useToast } from '../contexts/ToastContext';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export default function ToastViewport() {
  const { toasts, remove } = useToast();

  if (toasts.length === 0) return null;

  const iconFor = (tone: string) => {
    if (tone === 'success') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (tone === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[100] space-y-3 w-[320px] max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-white/92 dark:bg-secondary-900/92 backdrop-blur-xl border border-secondary-200/80 dark:border-secondary-700/70 shadow-2xl rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{iconFor(t.tone)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-secondary-900 dark:text-white truncate">
                {t.title}
              </div>
              {t.message && (
                <div className="text-sm text-secondary-600 dark:text-secondary-300 mt-0.5">
                  {t.message}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="p-1 rounded-lg text-secondary-500 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

