import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
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
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className={clsx(
            "fixed top-0 bottom-0 right-0 z-50 bg-zd-surface border-l border-zd-border shadow-modal flex flex-col text-zd-text outline-none animate-in slide-in-from-right duration-200",
            width
          )}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-zd-border flex items-center justify-between gap-3 shrink-0 bg-zd-surface">
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
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-xs font-sans">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
