import React, { useState } from 'react';
import { 
  Check, ThumbsUp, MessageSquare, Share2, MapPin, Plus, Radio 
} from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function CommunityReportsScreen({ onOpenAddReport }) {
  const [reports, setReports] = useState([
    {
      id: 1,
      initials: 'MK',
      name: 'Meena K.',
      isVerified: true,
      timeAgo: '12 min ago',
      location: 'Rampur Sector 4',
      badge: { type: 'distance', text: '0.8 km' },
      body: 'Waterlogging near the main market, avoid the route. Inundation is reaching curb level near the crossroad.',
      likes: 14,
      isLiked: false,
      comments: 3,
    },
    {
      id: 2,
      initials: 'SP',
      name: 'Suresh P.',
      isVerified: false,
      timeAgo: '28 min ago',
      location: 'Rampur Bridge',
      badge: { type: 'alert', text: 'Closure' },
      body: 'Rampur bridge road is closed, NDRF on site. Diverting light motor vehicles through outer ring canal bypass.',
      likes: 31,
      isLiked: false,
      comments: 7,
    },
  ]);

  const handleLike = (id) => {
    setReports(reports.map(r => {
      if (r.id === id) {
        return {
          ...r,
          likes: r.isLiked ? r.likes - 1 : r.likes + 1,
          isLiked: !r.isLiked,
        };
      }
      return r;
    }));
  };

  const handleShare = (report) => {
    if (navigator.share) {
      navigator.share({
        title: `Incident: ${report.name} in ${report.location}`,
        text: report.body,
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert("Report link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc] text-slate-900 pb-20">
      {/* Top Header */}
      <TopHeader currentRegion="All Regions" />

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Title & Live Feed Badge */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-[26px] font-black text-slate-900 tracking-tight">
              Community reports
            </h1>
            <span className="bg-[#ffedd5] text-[#9a3412] text-[11.5px] font-extrabold px-2.5 py-1 rounded-full border border-[#fed7aa]">
              Live Feed
            </span>
          </div>
          <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">
            Verified neighborhood telemetry and citizen advisories
          </p>
        </div>

        {/* Reports Feed */}
        <div className="flex flex-col gap-3.5">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="relative bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden pl-5"
            >
              {/* Burnt Orange Vertical Left Accent Stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-[4.5px] bg-[#c2410c]" />

              {/* Author Row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Avatar Circle */}
                  <div className="w-10 h-10 rounded-full bg-[#ffedd5] border border-[#fed7aa] flex items-center justify-center text-[#9a3412] font-bold text-xs">
                    {report.initials}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-bold text-slate-900">
                        {report.name}
                      </span>
                      {report.isVerified && (
                        <span className="w-4 h-4 rounded-full bg-[#22c55e] text-white flex items-center justify-center text-[10px] font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-[11.5px] text-slate-400 font-medium">
                      {report.timeAgo} · {report.location}
                    </span>
                  </div>
                </div>

                {/* Right Badge */}
                {report.badge.type === 'distance' && (
                  <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{report.badge.text}</span>
                  </span>
                )}
                {report.badge.type === 'alert' && (
                  <span className="bg-[#fee2e2] text-[#991b1b] text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                    <span>{report.badge.text}</span>
                  </span>
                )}
              </div>

              {/* Report Body */}
              <p className="text-[13.5px] text-slate-700 font-normal mt-3 leading-relaxed">
                {report.body}
              </p>

              {/* Actions Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-slate-500">
                <div className="flex items-center gap-4">
                  {/* Like */}
                  <button 
                    onClick={() => handleLike(report.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                      report.isLiked ? 'text-[#c2410c]' : 'hover:text-slate-900'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${report.isLiked ? 'fill-[#c2410c]' : ''}`} />
                    <span>{report.likes}</span>
                  </button>

                  {/* Comments */}
                  <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-slate-900 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{report.comments}</span>
                  </button>
                </div>

                {/* Share */}
                <button 
                  onClick={() => handleShare(report)}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Report Button */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            onClick={onOpenAddReport}
            className="w-full bg-white hover:bg-orange-50/50 text-[#9a3412] font-bold text-sm py-3 px-4 rounded-2xl border-2 border-[#9a3412] flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
          >
            <Plus className="w-4 h-4 text-[#9a3412]" strokeWidth={3} />
            <span>Add a report</span>
          </button>
          <p className="text-[11.5px] text-slate-400 text-center leading-snug px-3">
            Reports undergo automated telemetry correlation
          </p>
        </div>
      </div>
    </div>
  );
}
