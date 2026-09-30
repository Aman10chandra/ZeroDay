import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { LogoMark } from '../../components/ui/LogoMark';
import { Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { setRole, setIsAuthenticated, navigateScreen, addAuditLog } = useStore();
  const [identifier, setIdentifier] = useState('officer.rampur@sdrf.uk.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Inferred role from account
      const lower = identifier.toLowerCase();
      if (lower.includes('admin') || lower.includes('director')) {
        setRole('super_admin');
      } else if (lower.includes('ward') || lower.includes('panchayat')) {
        setRole('ward_rep');
      } else if (lower.includes('viewer') || lower.includes('public')) {
        setRole('viewer');
      } else {
        setRole('district_officer');
      }

      setIsAuthenticated(true);
      navigateScreen('overview');
      addAuditLog('AUTH_LOGIN', 'SESSION', `Officer logged in from control console: ${identifier}`);
      setIsLoading(false);
    }, 400);
  };

  const handleSSO = () => {
    setIsLoading(true);
    setTimeout(() => {
      setRole('district_officer');
      setIsAuthenticated(true);
      navigateScreen('overview');
      addAuditLog('AUTH_SSO_LOGIN', 'SESSION', 'Govt e-Pramaan SSO token verified');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zd-base flex items-center select-none">
      {/* Background Image with Slow Ken Burns Drift */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/assets/hero-valley.webp"
          alt="Himalayan Valley at Dawn"
          className="w-full h-full object-cover animate-ken-burns scale-105"
        />
        {/* Left-to-right dark gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F13]/90 via-[#0A0F13]/60 to-transparent" />
      </div>

      {/* Centered-left 380px form panel */}
      <div className="relative z-10 w-full max-w-[440px] pl-12 lg:pl-20">
        <div className="w-[380px] bg-[#10161B] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-10 shadow-modal">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <LogoMark size={28} />
            <div>
              <h1 className="font-sans font-semibold text-base text-zd-text tracking-tight">
                Sign in to ZeroDay
              </h1>
              <p className="font-sans text-xs text-zd-muted mt-0.5 leading-tight">
                Flood and landslide early warning for hill districts
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-[11px] text-zd-muted mb-1.5">
                Official ID or email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full h-9 px-3 rounded-[6px] bg-[#0A0F13] border border-[rgba(255,255,255,0.12)] text-[#EAF0F3] placeholder:text-zd-dim font-mono text-xs focus:outline-none focus:border-zd-accent focus:ring-1 focus:ring-zd-accent transition-colors"
                placeholder="officer@sdrf.uk.gov.in"
              />
            </div>

            <div>
              <label className="block font-sans text-[11px] text-zd-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-9 px-3 pr-9 rounded-[6px] bg-[#0A0F13] border border-[rgba(255,255,255,0.12)] text-[#EAF0F3] font-mono text-xs focus:outline-none focus:border-zd-accent focus:ring-1 focus:ring-zd-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zd-muted hover:text-zd-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button (40px for primary form buttons, dark text #06201E) */}
            <button
              type="submit"
              disabled={isLoading || !identifier}
              className="w-full h-10 rounded-control bg-zd-accent hover:opacity-95 text-[#06201E] font-sans font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-zd-accent/40"
            >
              {isLoading ? (
                <span className="font-mono text-xs">Authenticating...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Government SSO Link */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleSSO}
                className="text-zd-muted hover:text-zd-accent text-xs font-sans transition-colors inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-zd-accent" />
                <span>Use government SSO instead</span>
              </button>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-zd-border text-center">
              <p className="font-sans text-[11px] text-zd-dim leading-relaxed">
                Authorised personnel only. Actions are logged.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom-left telemetry info line */}
      <div className="absolute bottom-6 left-12 lg:left-20 z-10">
        <p className="font-mono text-xs text-zd-muted/90 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sev-normal inline-block animate-soft-pulse" />
          <span>42 sensors reporting</span>
          <span className="opacity-40">·</span>
          <span>Last model run 14:02 IST</span>
        </p>
      </div>
    </div>
  );
};
