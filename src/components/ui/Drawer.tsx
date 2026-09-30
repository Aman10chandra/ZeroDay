import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'w-96',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 lg:top-[52px] bottom-0 right-0 z-40 flex">
      {/* Backdrop for mobile */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] lg:hidden animate-in fade-in duration-100"
      />

      <aside
        role="dialog"
        aria-modal="true"
        className={clsx(
          "relative z-50 h-full bg-zd-surface border-l border-zd-border shadow-2xl flex flex-col transition-all duration-200 animate-in slide-in-from-right duration-200 text-zd-text",
          width
        )}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zd-border flex items-center justify-between gap-3 shrink-0 bg-zd-surface">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zd-text font-sans">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] font-mono text-zd-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-zd-muted hover:text-zd-text hover:bg-zd-hover transition-colors"
            aria-label="Close context drawer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-xs">
          {children}
        </div>
      </aside>
    </div>
  );
};
