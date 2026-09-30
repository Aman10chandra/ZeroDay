import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface TypedConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  expectedWord?: string; // e.g. "EVACUATE" or "OVERRIDE"
  confirmWord?: string;
  prompt?: string;
  confirmButtonLabel?: string;
  actionLabel?: string;
  variant?: 'destructive' | 'primary' | 'accent';
  metadataSummary?: { label: string; value: string }[];
}

export const TypedConfirmModal: React.FC<TypedConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  expectedWord,
  confirmWord,
  prompt,
  confirmButtonLabel,
  actionLabel,
  variant = 'destructive',
  metadataSummary,
}) => {
  const [typedInput, setTypedInput] = useState('');
  const targetWord = (expectedWord || confirmWord || 'CONFIRM').trim().toUpperCase();
  const isMatch = (typedInput || '').trim().toUpperCase() === targetWord;

  const handleConfirm = () => {
    if (!isMatch) return;
    onConfirm();
    setTypedInput('');
    onClose();
  };

  const handleClose = () => {
    setTypedInput('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2 text-sev-critical">
          <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2} />
          <span>{title}</span>
        </div>
      }
      subtitle="Critical two-step operations confirmation required"
      maxWidth="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant={variant}
            disabled={!isMatch}
            onClick={handleConfirm}
          >
            {actionLabel || confirmButtonLabel || 'Execute Action'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 font-sans text-xs">
        <p className="text-zd-muted leading-relaxed">
          {description}
        </p>

        {metadataSummary && metadataSummary.length > 0 && (
          <div className="p-2.5 rounded-[4px] bg-zd-base border border-zd-border divide-y divide-zd-border text-[11px] font-mono">
            {metadataSummary.map((item, idx) => (
              <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between">
                <span className="text-zd-muted">{item.label}</span>
                <span className="text-zd-text font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] text-zd-muted block">
            Type <span className="text-zd-text font-mono select-all bg-zd-base px-1.5 py-0.5 border border-zd-border rounded font-bold">{targetWord}</span> to authorize
          </label>
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder={`Type ${targetWord}`}
            autoFocus
            className="w-full h-9 px-3 bg-zd-base border border-zd-border rounded-[6px] font-mono text-xs text-zd-text placeholder:text-zd-dim focus:outline-none focus:border-zd-accent transition-colors"
          />
        </div>
      </div>
    </Modal>
  );
};
