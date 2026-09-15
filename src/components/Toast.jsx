import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onDismiss }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
  };

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    warning: 'bg-amber-50 border-amber-200 text-amber-950',
    info: 'bg-slate-900 border-slate-800 text-white'
  };

  return (
    <div className="fixed bottom-14 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
      <div className={`rounded-2xl p-3.5 shadow-xl border flex items-center justify-between gap-2.5 ${bgStyles[type] || bgStyles.info}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {icons[type] || icons.info}
          <p className="text-[12.5px] font-medium leading-snug truncate">
            {message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-black/10 text-current opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
