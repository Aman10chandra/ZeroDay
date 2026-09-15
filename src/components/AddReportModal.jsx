import React, { useState } from 'react';
import { Plus, X, MapPin, AlertCircle, Camera, Check } from 'lucide-react';

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
      name: authorName.trim() || 'Citizen Reporter',
      isVerified: false,
      timeAgo: 'Just now',
      location: location || 'Rampur Sector 4',
      badge: {
        type: category === 'Closure' ? 'alert' : 'distance',
        text: category === 'Closure' ? 'Closure' : 'Nearby',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="bg-[#9a3412] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <h3 className="font-bold text-base tracking-tight">
              Submit Neighborhood Report
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Your Name / Initials
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh K."
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#9a3412]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Location / Landmark
            </label>
            <input
              type="text"
              placeholder="e.g. Rampur Main Market"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#9a3412]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Category
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {['Waterlogging', 'Closure', 'Obstruction'].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-1 rounded-xl text-center font-bold border transition-all ${
                    category === cat 
                      ? 'bg-orange-50 text-[#9a3412] border-[#9a3412]' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Report Details
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe current road conditions, water level, or hazard..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#9a3412] leading-relaxed resize-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#9a3412] hover:bg-[#7c2d12] text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-950/20 active:scale-95"
            >
              Post Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
