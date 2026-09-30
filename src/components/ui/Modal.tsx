import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import clsx from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
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
  const maxWidths: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const widthClass = maxWidths[maxWidth] || maxWidth;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] animate-in fade-in-0 duration-150" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <Dialog.Content
            className={clsx(
              "w-full bg-zd-surface border border-zd-border rounded-panel shadow-modal overflow-hidden flex flex-col text-zd-text pointer-events-auto outline-none animate-in zoom-in-95 duration-150",
              widthClass
            )}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-zd-border flex items-center justify-between gap-4 shrink-0 bg-zd-surface">
              <div>
                <Dialog.Title className="text-sm font-semibold tracking-tight text-zd-text font-sans">
                  {title}
                </Dialog.Title>
                {subtitle && (
                  <Dialog.Description className="text-xs text-zd-muted mt-0.5 font-sans">
                    {subtitle}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close asChild>
                <button
                  className="w-7 h-7 rounded-control flex items-center justify-center text-zd-muted hover:text-zd-text hover:bg-zd-hover transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto max-h-[75vh] custom-scrollbar text-xs font-sans">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-3.5 border-t border-zd-border flex items-center justify-end gap-2 bg-zd-surface shrink-0">
                {footer}
              </div>
            )}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
