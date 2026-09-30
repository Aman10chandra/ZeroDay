import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={clsx(
          "w-full bg-zd-surface border border-zd-border rounded-panel shadow-2xl overflow-hidden flex flex-col text-zd-text animate-in zoom-in-95 duration-150",
          maxWidths[maxWidth]
        )}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zd-border flex items-center justify-between gap-4 shrink-0 bg-zd-surface">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zd-text font-sans">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] font-mono text-zd-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-zd-muted hover:text-zd-text hover:bg-zd-hover transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[75vh] custom-scrollbar text-xs">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-zd-border flex items-center justify-end gap-2 bg-zd-surface shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
