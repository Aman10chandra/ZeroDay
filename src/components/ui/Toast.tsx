import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import clsx from 'clsx';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'critical';
  title: string;
  message?: string;
  onUndo?: () => void;
  undoLabel?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto p-3.5 bg-zd-surface border border-zd-border rounded-panel shadow-modal flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'critical' ? (
                <span className="w-2 h-2 rounded-full bg-sev-critical mt-1.5 shrink-0 animate-soft-pulse" />
              ) : toast.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-sev-warning shrink-0 mt-0.5" strokeWidth={1.5} />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-sev-normal shrink-0 mt-0.5" strokeWidth={1.5} />
              )}
              <div className="space-y-0.5">
                <p className="font-sans font-semibold text-zd-text">{toast.title}</p>
                {toast.message && (
                  <p className="font-sans text-zd-muted text-[11px] leading-relaxed">{toast.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.onUndo && (
                <button
                  onClick={() => {
                    toast.onUndo?.();
                    onDismiss(toast.id);
                  }}
                  className="px-2 py-0.5 rounded bg-zd-raised text-zd-accent hover:underline font-mono text-[11px]"
                >
                  {toast.undoLabel || 'Recall (10s)'}
                </button>
              )}
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-zd-muted hover:text-zd-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
