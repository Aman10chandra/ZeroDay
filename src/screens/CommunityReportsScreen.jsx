import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Share2, Plus, Check } from 'lucide-react';
import TopHeader from '../components/TopHeader';

export default function CommunityReportsScreen({ 
  onOpenAddReport, 
  onShowToast,
  userRole = 'admin'
}) {
  const [reports, setReports] = useState([
    {
      id: 1,
      initials: 'MK',
      name: 'Meena K.',
      isVerified: true,
      timeAgo: '12m ago',
      location: 'Rampur Sector 4B',
      badge: '0.8 km',
      body: 'Waterlogging near the market crossing. Runoff reached curb level at 14:15.',
      likes: 14,
      isLiked: false,
      comments: 3,
    },
    {
      id: 2,
      initials: 'SP',
      name: 'Suresh P.',
      isVerified: false,
      timeAgo: '28m ago',
      location: 'Rampur Bridge Crossing',
      badge: 'Closure',
      body: 'Rampur bridge closed to light vehicles. Local police on site diverting toward canal bypass.',
      likes: 31,
      isLiked: false,
      comments: 7,
    },
    {
      id: 3,
      initials: 'AK',
      name: 'Anand K.',
      isVerified: true,
      timeAgo: '45m ago',
      location: 'Bhelupur Ring Road',
      badge: 'Clear',
      body: 'Canal retaining walls holding nominal head. Drainage culverts flowing unobstructed.',
      likes: 8,
      isLiked: false,
      comments: 1,
    }
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
    if (onShowToast) {
      onShowToast(`Report link copied for ${report.location}.`, "success");
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#FAF9F6] dark:bg-[#171B19] text-[#1A1D1B] dark:text-[#ECEAE4] pb-24 transition-colors">
      {/* Top Header */}
      <TopHeader currentRegion="Citizen Reports" userRole={userRole} />

      {/* Subheader */}
      <div className="w-full bg-[#FAF9F6] dark:bg-[#171B19] border-b border-[#D8D4CA] dark:border-[#2A302D]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold tracking-tight leading-tight">
              Field observations
            </h1>
            <p className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] leading-none mt-0.5">
              Citizen reports and ground truth advisories
            </p>
          </div>

          <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
            {reports.length} submissions
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-4">
        {/* Reports Feed as Clean Rows (Divided by 1px borders) */}
        <section aria-label="Field reports feed">
          <div className="border border-[#D8D4CA] dark:border-[#2A302D] rounded-[8px] divide-y divide-[#D8D4CA] dark:divide-[#2A302D] overflow-hidden text-xs">
            {reports.map((report) => (
              <article key={report.id} className="p-3.5 space-y-2 bg-[#FAF9F6] dark:bg-[#171B19]">
                {/* Author & Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-[4px] bg-[#ECE9E2] dark:bg-[#2A302D] flex items-center justify-center font-mono font-semibold text-[11px] text-[#1A1D1B] dark:text-[#ECEAE4]">
                      {report.initials}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-[#1A1D1B] dark:text-[#ECEAE4]">
                          {report.name}
                        </span>
                        {report.isVerified && (
                          <span className="text-[10px] font-mono text-[#2E7D4F] dark:text-[#389E65] border border-[#2E7D4F]/40 dark:border-[#389E65]/40 px-1 py-0.2 rounded-[2px] flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" strokeWidth={2} />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D] block">
                        {report.location} · {report.timeAgo}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10.5px] font-mono text-[#5C635E] dark:text-[#8A928D] border border-[#D8D4CA] dark:border-[#2A302D] px-1.5 py-0.5 rounded-[4px]">
                    {report.badge}
                  </span>
                </div>

                {/* Body Content */}
                <p className="text-xs text-[#1A1D1B] dark:text-[#ECEAE4] leading-relaxed">
                  {report.body}
                </p>

                {/* Interactions Row */}
                <div className="flex items-center justify-between pt-1 border-t border-[#D8D4CA]/50 dark:border-[#2A302D]/60 text-[11px] font-mono text-[#5C635E] dark:text-[#8A928D]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLike(report.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        report.isLiked ? 'text-[#1A1D1B] dark:text-[#ECEAE4] font-semibold' : 'hover:text-[#1A1D1B]'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{report.likes}</span>
                    </button>

                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{report.comments}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleShare(report)}
                    className="hover:text-[#1A1D1B] dark:hover:text-[#ECEAE4] transition-colors flex items-center gap-1"
                    title="Share incident report"
                  >
                    <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Share</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Bottom Action Zone: File Report Button */}
      <aside 
        aria-label="Submit observation action"
        className="fixed bottom-0 left-0 right-0 w-full bg-[#FAF9F6] dark:bg-[#171B19] border-t border-[#D8D4CA] dark:border-[#2A302D] z-20"
      >
        <div className="max-w-5xl mx-auto p-3">
          <button
            onClick={onOpenAddReport}
            className="w-full h-11 px-4 bg-[#1A1D1B] dark:bg-[#ECEAE4] text-[#FAF9F6] dark:text-[#0F1211] text-xs font-semibold rounded-[8px] flex items-center justify-center gap-1.5 transition-calm hover:opacity-90"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Submit field observation</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
