import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { SeverityDot } from '../../components/ui/SeverityDot';
import { 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  MoreVertical, 
  MapPin, 
  Camera, 
  ShieldAlert, 
  Clock, 
  Share2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { CommunityFieldReport } from '../../types';

export const CommunityReportsScreen: React.FC = () => {
  const { 
    reports, 
    wards, 
    addReport, 
    verifyReport, 
    markReportUrgent, 
    escalateReport, 
    dismissReport,
    createAlert,
    addAuditLog,
    showToast 
  } = useStore();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(reports[0]?.id || null);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // New report form state
  const [category, setCategory] = useState<'slope_movement' | 'culvert_blockage' | 'river_surge' | 'rockfall'>('slope_movement');
  const [description, setDescription] = useState('');
  const [wardId, setWardId] = useState('ward-rampur-4b');

  const selectedReport = reports.find(r => r.id === selectedReportId) || null;

  const filteredReports = reports.filter(r => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    return true;
  });

  const handleVerify = (report: CommunityFieldReport) => {
    verifyReport(report.id, 'Verified via drone camera feed');
    showToast({
      type: 'success',
      title: 'Report Verified',
      message: `Citizen report ${report.code} confirmed by control desk.`,
    });
    addAuditLog('VERIFY_REPORT', report.code, 'Field observation verified as authentic');
  };

  const handleEscalate = (report: CommunityFieldReport) => {
    escalateReport(report.id);
    createAlert({
      title: `ESCALATED FROM FIELD REPORT: ${report.category.replace('_', ' ').toUpperCase()}`,
      titleHi: `मैदानी अवलोकन से चेतावनी: ${report.wardName}`,
      body: `Verified observation (${report.code}): ${report.description}`,
      bodyHi: `सत्यापित नागरिक अवलोकन (${report.code}): ${report.description}`,
      severity: 'critical',
      regionId: report.wardId,
      channels: ['push', 'sms', 'ble_mesh'],
      directiveType: 'EVACUATION',
    });
    showToast({
      type: 'critical',
      title: 'Report Escalated to Alert',
      message: `Broadcasted emergency bulletin based on report ${report.code}`,
    });
    addAuditLog('ESCALATE_REPORT', report.code, 'Escalated to critical alert directive');
    setMenuOpen(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    const targetWard = wards.find(w => w.id === wardId);

    await addReport({
      category,
      wardId,
      wardName: targetWard?.name || 'Rampur Basin 4B',
      description,
      reporterName: 'Field Observer',
      reporterContact: '+91-98111-22334',
      urgency: 'high',
      mediaUrl: category === 'river_surge' ? '/assets/flooded-road.webp' : '/assets/landslide-scar.webp',
    });

    setDescription('');
    setAddModalOpen(false);
    showToast({
      type: 'success',
      title: 'Report Filed',
      message: 'Citizen observation queued for verification',
    });
  };

  return (
    <div className="relative w-full h-full flex overflow-hidden bg-zd-base text-zd-text select-none">
      {/* Slim Queue on Left (3-5 visible items) */}
      <div className="w-80 h-full border-r border-zd-border bg-zd-surface flex flex-col shrink-0 z-10">
        {/* Queue Header with Filters & Add Report */}
        <div className="p-4 border-b border-zd-border flex items-center justify-between">
          <div>
            <h2 className="font-sans font-semibold text-sm text-zd-text">Citizen Reports</h2>
            <span className="font-mono text-[11px] text-zd-dim">{filteredReports.length} queued</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Popover */}
            <div className="relative">
              <button
                onClick={() => setFilterPopoverOpen(!filterPopoverOpen)}
                className={`w-7 h-7 rounded-[4px] border flex items-center justify-center transition-colors ${
                  filterPopoverOpen
                    ? 'bg-zd-accent text-zd-base border-zd-accent'
                    : 'bg-zd-base border-zd-border text-zd-muted hover:text-zd-text'
                }`}
                title="Filter reports"
              >
                <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>

              {filterPopoverOpen && (
                <div className="absolute right-0 mt-1 w-44 p-1.5 bg-zd-surface border border-zd-border rounded-panel shadow-popover z-50 text-xs font-sans">
                  <span className="text-micro text-zd-dim px-2 py-1 block border-b border-zd-border mb-1">
                    Filter by Category
                  </span>
                  {[
                    { key: 'all', label: 'All Categories' },
                    { key: 'slope_movement', label: 'Slope movement' },
                    { key: 'culvert_blockage', label: 'Culvert blockage' },
                    { key: 'river_surge', label: 'River surge' },
                    { key: 'rockfall', label: 'Rockfall' },
                  ].map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setFilterCategory(cat.key);
                        setFilterPopoverOpen(false);
                      }}
                      className="w-full px-2 py-1.5 rounded-[4px] text-left hover:bg-zd-hover text-zd-text transition-colors"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Report Button */}
            <button
              onClick={() => setAddModalOpen(true)}
              className="h-7 px-2.5 rounded-[4px] bg-zd-accent hover:bg-zd-accent-hover text-zd-base font-sans text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* List of 3-5 items */}
        <div className="flex-1 divide-y divide-zd-border overflow-y-auto custom-scrollbar">
          {filteredReports.map(rep => {
            const isSelected = selectedReportId === rep.id;
            const photo = rep.category === 'river_surge' ? '/assets/flooded-road.webp' : '/assets/landslide-scar.webp';

            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReportId(rep.id)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-zd-raised' : 'hover:bg-zd-hover'
                }`}
              >
                {/* Photo Thumbnail */}
                <div className="w-12 h-12 rounded-[4px] bg-zd-base overflow-hidden shrink-0 border border-zd-border">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 truncate">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-sans text-xs font-medium text-zd-text truncate">
                      {rep.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        rep.status === 'verified'
                          ? 'bg-sev-normal'
                          : rep.urgency === 'high'
                          ? 'bg-sev-critical animate-pulse'
                          : 'bg-sev-warning'
                      }`}
                    />
                  </div>

                  <p className="font-sans text-[11px] text-zd-muted truncate">
                    {rep.wardName}
                  </p>

                  <span className="font-mono text-[10px] text-zd-dim block mt-1">
                    {/^\d{4}-\d{2}-\d{2}T/.test(rep.timestamp) ? `${rep.timestamp.slice(11, 16)} IST` : rep.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center: The Map with Pins (Focal Point) */}
      <div className="flex-1 relative overflow-hidden bg-zd-base">
        <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="reportGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#reportGrid)" />

          {/* Contour and river elements */}
          <path d="M 60 540 C 240 500, 360 420, 500 300 C 620 200, 720 160, 800 120" fill="none" stroke="#214050" strokeWidth="12" opacity="0.5" />
          <path d="M 60 540 C 240 500, 360 420, 500 300 C 620 200, 720 160, 800 120" fill="none" stroke="#5CC8BE" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />

          {/* Map Pins for each report */}
          {reports.map((rep, idx) => {
            const x = 200 + (idx * 130) % 500;
            const y = 160 + (idx * 90) % 360;
            const isSelected = selectedReportId === rep.id;

            return (
              <g
                key={rep.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => setSelectedReportId(rep.id)}
                className="cursor-pointer"
              >
                <circle
                  r={isSelected ? 10 : 7}
                  fill={rep.status === 'verified' ? '#4CB782' : '#E8843A'}
                  stroke="#0A0F13"
                  strokeWidth="2"
                  className="transition-all"
                />
                {isSelected && (
                  <circle r="18" fill="none" stroke="#5CC8BE" strokeWidth="1" className="animate-ping" />
                )}
                <text
                  x="14"
                  y="4"
                  fill="#EAF0F3"
                  fontSize="11"
                  fontFamily="sans-serif"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {rep.category.replace('_', ' ')}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Map Overlay Indicator */}
        <div className="absolute bottom-4 left-4 font-mono text-[10px] text-zd-dim bg-zd-surface/80 px-2 py-0.5 rounded border border-zd-border">
          Active Field Pins: {filteredReports.length}
        </div>
      </div>

      {/* Right Drawer for Selected Report */}
      <Drawer
        isOpen={selectedReport !== null}
        onClose={() => setSelectedReportId(null)}
        title={selectedReport?.category ? selectedReport.category.replace('_', ' ').toUpperCase() : 'Report Detail'}
        subtitle={`${selectedReport?.wardName} · ${selectedReport?.code}`}
        width="w-96"
      >
        {selectedReport && (
          <div className="space-y-5 font-sans text-xs flex flex-col h-full justify-between">
            <div className="space-y-4">
              {/* Photo from Generated Assets */}
              <div className="w-full h-44 rounded-panel overflow-hidden bg-black border border-zd-border relative">
                <img
                  src={selectedReport.category === 'river_surge' ? '/assets/flooded-road.webp' : '/assets/landslide-scar.webp'}
                  alt="Field Observation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[4px] bg-black/75 border border-white/10 font-mono text-[10px] text-white">
                  GEO-STAMPED
                </div>
              </div>

              {/* Status and Confirmations */}
              <div className="p-3 bg-zd-base border border-zd-border rounded-panel flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-zd-muted">Status:</span>
                  <span className={`font-semibold capitalize ${selectedReport.status === 'verified' ? 'text-sev-normal' : 'text-sev-warning'}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <span className="font-mono text-zd-dim">
                  {selectedReport.confirmationsCount} civilian confirmations
                </span>
              </div>

              {/* Description */}
              <div className="p-3 bg-zd-base border border-zd-border rounded-panel">
                <span className="text-zd-muted block text-[11px] mb-1">Observation Description:</span>
                <p className="text-zd-text leading-relaxed">
                  {selectedReport.description}
                </p>
              </div>

              {/* Reporter Contact */}
              <div className="p-3 bg-zd-base border border-zd-border rounded-panel space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zd-muted font-sans">Reporter:</span>
                  <span className="text-zd-text">{selectedReport.reporterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zd-muted font-sans">Contact:</span>
                  <span className="text-zd-text">{selectedReport.reporterContact}</span>
                </div>
              </div>
            </div>

            {/* Admin Actions: Primary "Verify" + Menu */}
            <div className="pt-4 border-t border-zd-border flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => handleVerify(selectedReport)}
                className="flex-1 h-9 font-sans text-xs font-semibold gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify report</span>
              </Button>

              {/* More Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-[6px] border border-zd-border bg-zd-surface hover:bg-zd-raised flex items-center justify-center text-zd-muted hover:text-zd-text transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 bottom-10 w-48 p-1.5 bg-zd-surface border border-zd-border rounded-panel shadow-popover z-50 text-xs font-sans">
                    <button
                      onClick={() => {
                        markReportUrgent(selectedReport.id);
                        showToast({ type: 'warning', title: 'Marked Urgent', message: 'Report priority escalated' });
                        setMenuOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-[4px] hover:bg-zd-hover flex items-center gap-2 text-zd-text text-left"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-sev-warning" />
                      <span>Mark urgent</span>
                    </button>

                    <button
                      onClick={() => handleEscalate(selectedReport)}
                      className="w-full px-2.5 py-1.5 rounded-[4px] hover:bg-zd-hover flex items-center gap-2 text-sev-critical text-left font-semibold"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Escalate to alert</span>
                    </button>

                    <button
                      onClick={() => {
                        showToast({ type: 'info', title: 'Merged', message: 'Merged with adjacent observation' });
                        setMenuOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-[4px] hover:bg-zd-hover flex items-center gap-2 text-zd-muted text-left"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Merge duplicate</span>
                    </button>

                    <div className="my-1 border-t border-zd-border" />

                    <button
                      onClick={() => {
                        dismissReport(selectedReport.id);
                        setSelectedReportId(null);
                        showToast({ type: 'info', title: 'Report Dismissed', message: 'Removed from priority queue' });
                        setMenuOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-[4px] hover:bg-zd-hover flex items-center gap-2 text-zd-dim text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Short 3-Field Add Report Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="File Field Observation"
        subtitle="Log civilian slope tension crack or culvert surge report"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 font-sans text-xs">
          {/* Field 1: Category Chips */}
          <div>
            <label className="block text-zd-muted mb-1.5">Observation Category</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'slope_movement', label: 'Slope Movement' },
                { id: 'culvert_blockage', label: 'Culvert Blockage' },
                { id: 'river_surge', label: 'River Surge' },
                { id: 'rockfall', label: 'Rockfall / Debris' },
              ].map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id as any)}
                  className={`h-8 rounded-[6px] border text-left px-2.5 transition-colors ${
                    category === cat.id
                      ? 'bg-zd-raised border-zd-accent text-zd-text font-semibold'
                      : 'bg-zd-base border-zd-border text-zd-muted'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field 2: Description */}
          <div>
            <label className="block text-zd-muted mb-1.5">Observation Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g. Road subsidence on bend 4, muddy runoff crossing asphalt..."
              className="w-full p-2.5 bg-zd-base border border-zd-border rounded-[6px] text-zd-text font-sans text-xs focus:outline-none focus:border-zd-accent"
            />
          </div>

          {/* Field 3: Sector Location */}
          <div>
            <label className="block text-zd-muted mb-1.5">Territory Sector</label>
            <select
              value={wardId}
              onChange={(e) => setWardId(e.target.value)}
              className="w-full h-8 px-2.5 bg-zd-base border border-zd-border rounded-[6px] text-zd-text font-sans text-xs"
            >
              {wards.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit observation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
