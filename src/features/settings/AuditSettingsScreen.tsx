import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { 
  User, 
  Users, 
  Languages, 
  HardDrive, 
  BellRing, 
  Radio, 
  FileText, 
  Download, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  Search,
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../../types';

export const AuditSettingsScreen: React.FC = () => {
  const { 
    currentUser, 
    setRole, 
    language, 
    setLanguage, 
    sirenVolume, 
    setSirenVolume, 
    strobeEnabled, 
    isOpsMode, 
    toggleOpsMode, 
    auditLogs, 
    addAuditLog,
    showToast 
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'team' | 'language' | 'offline_maps' | 'notifications' | 'mesh' | 'audit'
  >('profile');

  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [auditFilter, setAuditFilter] = useState('');
  const [cacheCleared, setCacheCleared] = useState(false);

  // Invite state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('district_officer');

  const navItems = [
    { id: 'profile' as const, label: 'Profile' },
    { id: 'team' as const, label: 'Team and roles' },
    { id: 'language' as const, label: 'Language' },
    { id: 'offline_maps' as const, label: 'Offline maps' },
    { id: 'notifications' as const, label: 'Notifications and siren' },
    { id: 'mesh' as const, label: 'Mesh diagnostics' },
    { id: 'audit' as const, label: 'Audit log' },
  ];

  const teamMembers = [
    { name: 'M. Joshi', badge: 'SDRF-UK-8842', role: 'super_admin', email: 'm.joshi@sdrf.uk.gov.in', station: 'Kotdwar DEOC' },
    { name: 'P. Rawat', badge: 'DEOC-KT-102', role: 'district_officer', email: 'p.rawat@uk.gov.in', station: 'Pauri Control Room' },
    { name: 'S. Negi', badge: 'WR-RMP-04', role: 'ward_rep', email: 's.negi@rampur.panchayat.in', station: 'Rampur Ward Office' },
    { name: 'Observer Node', badge: 'VIEW-PUBLIC', role: 'viewer', email: 'public.desk@disaster.uk.gov.in', station: 'State Operations Centre' },
  ];

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,Actor,Role,Action,Target,Details\n" +
      auditLogs.map(a => `"${a.timestamp}","${a.actor}","${a.role}","${a.action}","${a.target}","${a.details.replace(/"/g, '""')}"`).join("\n");
    
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encoded;
    link.download = `ZeroDay_Audit_Log_${Date.now()}.csv`;
    link.click();
    showToast({ type: 'success', title: 'Audit Trail Exported', message: `Exported ${auditLogs.length} verified operations logs` });
    addAuditLog('EXPORT_AUDIT_LOG', 'SYSTEM', `Exported ${auditLogs.length} audit entries to CSV`);
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    if (!auditFilter) return true;
    const q = auditFilter.toLowerCase();
    return log.action.toLowerCase().includes(q) || log.target.toLowerCase().includes(q) || log.details.toLowerCase().includes(q) || log.actor.toLowerCase().includes(q);
  });

  return (
    <div className="w-full h-full flex overflow-hidden bg-zd-base text-zd-text select-none">
      {/* Text-Only Left Sub-Nav (Generous spacing, simple layout) */}
      <div className="w-64 h-full border-r border-zd-border bg-zd-surface/40 p-6 flex flex-col justify-between shrink-0">
        <div>
          <h2 className="font-sans font-semibold text-xs text-zd-muted mb-6">
            Settings
          </h2>

          <nav className="flex flex-col gap-1.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left py-2 px-3 rounded-[6px] font-sans text-xs transition-colors ${
                  activeTab === item.id
                    ? 'bg-zd-raised text-zd-text font-semibold'
                    : 'text-zd-muted hover:text-zd-text hover:bg-zd-hover'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="font-mono text-[11px] text-zd-dim">
          ZeroDay v4.2.1-prod<br />
          Uttarakhand DEOC Edition
        </div>
      </div>

      {/* Main Content Area (One section visible at a time, generous spacing) */}
      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar max-w-4xl">
        {/* SECTION 1: Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-sans font-semibold text-xl text-zd-text">Operator Profile</h1>
              <p className="font-sans text-xs text-zd-muted mt-1">Authenticated control room duty officer details</p>
            </div>

            <div className="space-y-6 divide-y divide-zd-border">
              <div className="pt-6 flex justify-between items-center font-sans text-xs">
                <div>
                  <span className="font-medium text-zd-text block">Official Name</span>
                  <span className="text-zd-muted">Assigned command room officer identity</span>
                </div>
                <span className="font-semibold text-zd-text font-mono">{currentUser.name}</span>
              </div>

              <div className="pt-6 flex justify-between items-center font-sans text-xs">
                <div>
                  <span className="font-medium text-zd-text block">Badge Number</span>
                  <span className="text-zd-muted">State Disaster Response Force service identifier</span>
                </div>
                <span className="font-mono text-zd-text">{currentUser.badgeNumber}</span>
              </div>

              <div className="pt-6 flex justify-between items-center font-sans text-xs">
                <div>
                  <span className="font-medium text-zd-text block">Station / Post</span>
                  <span className="text-zd-muted">Active emergency dispatch room terminal</span>
                </div>
                <span className="text-zd-text font-mono">{currentUser.station}</span>
              </div>

              <div className="pt-6 flex justify-between items-center font-sans text-xs">
                <div>
                  <span className="font-medium text-zd-text block">Assigned Role</span>
                  <span className="text-zd-muted">Operational access clearance tier</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-[4px] bg-zd-raised border border-zd-border font-mono text-[11px] capitalize text-zd-accent font-semibold">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Team and Roles */}
        {activeTab === 'team' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-sans font-semibold text-xl text-zd-text">Team and Roles</h1>
                <p className="font-sans text-xs text-zd-muted mt-1">Role-based access control and station roster</p>
              </div>

              <Button
                variant="primary"
                onClick={() => setInviteModalOpen(true)}
                className="gap-1.5 font-sans text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite officer</span>
              </Button>
            </div>

            {/* Team Table with Role Pills */}
            <div className="border border-zd-border rounded-panel overflow-hidden bg-zd-surface">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-zd-base border-b border-zd-border font-mono text-micro text-zd-muted">
                  <tr>
                    <th className="py-3 px-4 font-normal">Officer</th>
                    <th className="py-3 px-3 font-normal">Badge</th>
                    <th className="py-3 px-3 font-normal">Role</th>
                    <th className="py-3 px-4 font-normal">Station</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zd-border font-mono text-xs">
                  {teamMembers.map((member, i) => (
                    <tr key={i} className="hover:bg-zd-hover transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-zd-text">
                        <div>{member.name}</div>
                        <div className="text-[11px] font-mono text-zd-dim">{member.email}</div>
                      </td>
                      <td className="py-3 px-3 text-zd-muted">{member.badge}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-[4px] bg-zd-base border border-zd-border font-sans text-[11px] capitalize text-zd-text">
                          {member.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-zd-muted">{member.station}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Permissions Matrix Collapsed Under "View permissions" */}
            <div className="border border-zd-border rounded-panel bg-zd-surface overflow-hidden">
              <div
                onClick={() => setPermissionsOpen(!permissionsOpen)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zd-hover transition-colors"
              >
                <span className="font-sans text-xs font-semibold text-zd-text">View permissions matrix</span>
                {permissionsOpen ? <ChevronUp className="w-4 h-4 text-zd-muted" /> : <ChevronDown className="w-4 h-4 text-zd-muted" />}
              </div>

              {permissionsOpen && (
                <div className="p-4 border-t border-zd-border font-sans text-xs space-y-3 bg-zd-base">
                  <div className="flex justify-between pb-2 border-b border-zd-border">
                    <span className="font-semibold text-zd-text">Super Admin</span>
                    <span className="text-zd-muted">Full Sluice Override, Alert Broadcast, RBAC Management</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zd-border">
                    <span className="font-semibold text-zd-text">District Officer</span>
                    <span className="text-zd-muted">Evacuation Corridor Dispatch, Stage Shelters, Sensor Calibration</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-zd-border">
                    <span className="font-semibold text-zd-text">Ward Representative</span>
                    <span className="text-zd-muted">Citizen Field Report Verification, Local Alert Staging</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-zd-text">Read-Only Viewer</span>
                    <span className="text-zd-muted">Situational Awareness Telemetry Monitoring Only</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: Language */}
        {activeTab === 'language' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-sans font-semibold text-xl text-zd-text">Language</h1>
              <p className="font-sans text-xs text-zd-muted mt-1">Control room console interface language</p>
            </div>

            <div className="space-y-6 divide-y divide-zd-border">
              <div className="pt-6 flex justify-between items-center font-sans text-xs">
                <div>
                  <span className="font-medium text-zd-text block">Interface Language</span>
                  <span className="text-zd-muted">Select operational display language for UI labels and notifications</span>
                </div>

                <div className="flex rounded-[6px] border border-zd-border overflow-hidden font-mono text-xs">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      showToast({ type: 'info', title: 'Language Updated', message: 'Interface language set to English' });
                    }}
                    className={`px-3 py-1.5 transition-colors ${language === 'en' ? 'bg-zd-raised text-zd-text font-bold' : 'text-zd-muted hover:text-zd-text'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('hi');
                      showToast({ type: 'info', title: 'भाषा अपडेट की गई', message: 'इंटरफ़ेस भाषा हिन्दी पर सेट की गई' });
                    }}
                    className={`px-3 py-1.5 transition-colors ${language === 'hi' ? 'bg-zd-raised text-zd-text font-bold' : 'text-zd-muted hover:text-zd-text'}`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Offline Maps */}
        {activeTab === 'offline_maps' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-sans font-semibold text-xl text-zd-text">Offline Maps</h1>
              <p className="font-sans text-xs text-zd-muted mt-1">Locally cached vector tiles and DEM hillshade for network disruptions</p>
            </div>

            <div className="space-y-6 divide-y divide-zd-border">
              <div className="pt-6 flex justify-between items-center font-sans text-xs">
                <div>
                  <span className="font-medium text-zd-text block">Kotdwar Catchment Pack</span>
                  <span className="text-zd-muted">Vector contours, hydrology network, and DEM 30m raster (42.4 MB)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sev-normal font-mono text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cached in IndexedDB</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCacheCleared(true);
                      showToast({ type: 'info', title: 'Cache Refreshed', message: 'Topographic tile pack verified' });
                    }}
                    className="font-sans text-xs"
                  >
                    Re-sync
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: Notifications & Siren */}
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-sans font-semibold text-xl text-zd-text">Notifications and Siren</h1>
              <p className="font-sans text-xs text-zd-muted mt-1">Audible sirens, web audio oscillators, and photosensitive safety</p>
            </div>

            <div className="space-y-6 divide-y divide-zd-border">
              <div className="pt-6 flex justify-between items-center font-sans text-xs">
                <div>
                  <span className="font-medium text-zd-text block">Siren Volume (Web Audio)</span>
                  <span className="text-zd-muted">Master acoustic level for two-tone critical incident oscillator</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={sirenVolume}
                    onChange={(e) => setSirenVolume(parseFloat(e.target.value))}
                    className="w-28 accent-zd-accent"
                  />
                  <span className="font-mono text-xs text-zd-text w-8 text-right">
                    {Math.round(sirenVolume * 100)}%
                  </span>
                </div>
              </div>

              <div className="pt-6 flex justify-between items-center font-sans text-xs">
                <div>
                  <span className="font-medium text-zd-text block">Console Color Theme</span>
                  <span className="text-zd-muted">Switch between Dawn Slate dark mode and Warm Paper light mode</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleOpsMode}
                  className="font-sans text-xs"
                >
                  {isOpsMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: Mesh Diagnostics */}
        {activeTab === 'mesh' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-sans font-semibold text-xl text-zd-text">Mesh Diagnostics</h1>
              <p className="font-sans text-xs text-zd-muted mt-1">Hardware communication interface parameters</p>
            </div>

            <div className="space-y-6 divide-y divide-zd-border">
              <div className="pt-6 flex justify-between items-center font-sans text-xs">
                <div>
                  <span className="font-medium text-zd-text block">LoRA Channel Frequency</span>
                  <span className="text-zd-muted">Semtech SX1276 uplink frequency band</span>
                </div>
                <span className="font-mono text-zd-text font-bold">868.10 MHz (India/EU)</span>
              </div>

              <div className="pt-6 flex justify-between items-center font-sans text-xs">
                <div>
                  <span className="font-medium text-zd-text block">BLE Mesh Flooding TTL</span>
                  <span className="text-zd-muted">Maximum relay hops before packet expiration</span>
                </div>
                <span className="font-mono text-zd-text font-bold">4 Hops (Default)</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: Audit Log */}
        {activeTab === 'audit' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-sans font-semibold text-xl text-zd-text">Audit Log</h1>
                <p className="font-sans text-xs text-zd-muted mt-1">Immutable cryptographic log of control actions</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-1.5 font-sans text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>

            {/* Filter Search */}
            <div className="relative max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zd-dim" />
              <input
                type="text"
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full h-8 pl-8 pr-3 rounded-[6px] bg-zd-surface border border-zd-border text-zd-text font-mono text-xs focus:outline-none focus:border-zd-accent"
              />
            </div>

            {/* Audit Log Clean Table */}
            <div className="border border-zd-border rounded-panel overflow-hidden bg-zd-surface">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-zd-base border-b border-zd-border font-mono text-micro text-zd-muted">
                  <tr>
                    <th className="py-2.5 px-4 font-normal">Timestamp</th>
                    <th className="py-2.5 px-3 font-normal">Actor</th>
                    <th className="py-2.5 px-3 font-normal">Action</th>
                    <th className="py-2.5 px-3 font-normal">Target</th>
                    <th className="py-2.5 px-4 font-normal">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zd-border font-mono text-xs">
                  {filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-zd-hover transition-colors">
                      <td className="py-3 px-4 text-zd-dim">{log.timestamp.slice(11, 19)}</td>
                      <td className="py-3 px-3 text-zd-text font-sans font-medium">{log.actor}</td>
                      <td className="py-3 px-3 text-zd-accent">{log.action}</td>
                      <td className="py-3 px-3 text-zd-muted">{log.target}</td>
                      <td className="py-3 px-4 font-sans text-zd-text">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invite Officer Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Control Officer"
        subtitle="Provision duty station access token"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-zd-muted mb-1.5">Full Name</label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="E.g. Inspector R. Sharma"
              className="w-full h-8 px-3 rounded-[6px] bg-zd-base border border-zd-border text-zd-text"
            />
          </div>

          <div>
            <label className="block text-zd-muted mb-1.5">Official Gov Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="officer@sdrf.uk.gov.in"
              className="w-full h-8 px-3 rounded-[6px] bg-zd-base border border-zd-border text-zd-text"
            />
          </div>

          <div>
            <label className="block text-zd-muted mb-1.5">Assigned Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full h-8 px-3 rounded-[6px] bg-zd-base border border-zd-border text-zd-text"
            >
              <option value="district_officer">District Officer</option>
              <option value="ward_rep">Ward Representative</option>
              <option value="viewer">Viewer</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                showToast({ type: 'success', title: 'Invitation Sent', message: `Station invite token issued to ${inviteEmail}` });
                setInviteModalOpen(false);
              }}
            >
              Issue credentials
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
