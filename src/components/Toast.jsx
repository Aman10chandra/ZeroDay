import React from 'react';
import { X } from 'lucide-react';

export default function Toast({ message, type = 'info', onDismiss }) {
  if (!message) return null;

  const dotColors = {
    success: 'bg-[#2E7D4F] dark:bg-[#389E65]',
    warning: 'bg-[#D2620A] dark:bg-[#E87214]',
    critical: 'bg-[#C1271D] dark:bg-[#D9382E]',
    info: 'bg-[#1A1D1B] dark:bg-[#ECEAE4]',
  };

  return (
    <aside 
      role="status" 
      aria-live="polite"
      className="fixed bottom-16 left-4 right-4 max-w-[368px] mx-auto z-50 transition-calm"
    >
      <div className="bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] p-3 shadow-modal flex items-center justify-between gap-3 text-[#1A1D1B] dark:text-[#ECEAE4]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[type] || dotColors.info}`} />
          <p className="text-xs font-mono truncate leading-normal">
            {message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors flex-shrink-0"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
