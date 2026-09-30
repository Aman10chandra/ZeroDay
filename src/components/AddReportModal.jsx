import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddReportModal({ isOpen, onClose, onAdd }) {
  const [authorName, setAuthorName] = useState('');
  const [location, setLocation] = useState('Rampur Ward 3');
  const [category, setCategory] = useState('Waterlogging');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newReport = {
      id: Date.now(),
      initials: (authorName.trim() || 'You').slice(0, 2).toUpperCase(),
      name: authorName.trim() || 'Citizen observer',
      isVerified: false,
      timeAgo: 'Just now',
      location: location || 'Rampur Sector 4B',
      badge: {
        type: category === 'Closure' ? 'alert' : 'distance',
        text: category,
      },
      body: description,
      likes: 1,
      isLiked: true,
      comments: 0,
    };

    if (onAdd) onAdd(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 transition-calm">
      <div 
        role="dialog"
        aria-labelledby="report-dialog-title"
        className="w-full sm:max-w-md bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-t-[8px] sm:rounded-[8px] shadow-modal overflow-hidden text-[#1A1D1B] dark:text-[#ECEAE4]"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#D8D4CA] dark:border-[#2A302D] flex items-center justify-between">
          <div>
            <h3 id="report-dialog-title" className="text-sm font-semibold tracking-tight">
              File field report
            </h3>
            <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] mt-0.5">
              Ground observation submission
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block mb-1">
              Reporter identifier
            </label>
            <input
              type="text"
              placeholder="Name or callsign"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full h-10 px-3 bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] font-mono text-xs text-[#1A1D1B] dark:text-[#ECEAE4] focus:outline-none focus:border-[#1A1D1B] dark:focus:border-[#ECEAE4]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block mb-1">
              Coordinates / Landmark
            </label>
            <input
              type="text"
              placeholder="e.g. Rampur Bridge East Culvert"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 px-3 bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] font-mono text-xs text-[#1A1D1B] dark:text-[#ECEAE4] focus:outline-none focus:border-[#1A1D1B] dark:focus:border-[#ECEAE4]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block mb-1">
              Observation category
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              {['Waterlogging', 'Closure', 'Landslide'].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`h-10 rounded-[8px] text-xs font-medium border transition-calm ${
                    category === cat 
                      ? 'bg-[#1A1D1B] text-[#FAF9F6] border-[#1A1D1B] dark:bg-[#ECEAE4] dark:text-[#0F1211] dark:border-[#ECEAE4]' 
                      : 'border-[#D8D4CA] dark:border-[#2A302D] text-[#5C635E] dark:text-[#8A928D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase tracking-[0.06em] text-[#5C635E] dark:text-[#8A928D] block mb-1">
              Observation details
            </label>
            <textarea
              required
              placeholder="Detail water level, road condition, or structural risk."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-[#FAF9F6] dark:bg-[#171B19] border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] font-mono text-xs text-[#1A1D1B] dark:text-[#ECEAE4] leading-relaxed resize-none focus:outline-none focus:border-[#1A1D1B] dark:focus:border-[#ECEAE4]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-[8px] border border-[#D8D4CA] dark:border-[#2A302D] font-medium text-xs text-[#5C635E] dark:text-[#8A928D] hover:text-[#1A1D1B] transition-calm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-5 rounded-[8px] font-semibold text-xs text-white bg-[#1A1D1B] hover:bg-[#2E3330] dark:bg-[#ECEAE4] dark:text-[#0F1211] dark:hover:bg-[#D4D0C7] transition-calm"
            >
              Submit field report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
