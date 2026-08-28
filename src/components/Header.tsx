import React from 'react';
import { GlobalNavTab } from '../types';

interface HeaderProps {
  extinctionProbability: number;
  activeNavTab: GlobalNavTab;
  onSelectNavTab: (tab: GlobalNavTab) => void;
  onOpenOperatorModal: () => void;
  onJumpToDiscussions?: () => void;
  operatorClearance: string;
  operatorId: string;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  kardashevRating?: number;
}

export const Header: React.FC<HeaderProps> = ({
  extinctionProbability,
  activeNavTab,
  onSelectNavTab,
  onOpenOperatorModal,
  onJumpToDiscussions,
  operatorClearance,
  operatorId,
  mobileMenuOpen,
  onToggleMobileMenu,
  kardashevRating = 0.727,
}) => {
  return (
    <header
      id="command-header"
      className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#0e0e0e] border-b border-[#2C2E33] z-40 px-4 lg:px-8 flex items-center justify-between"
    >
      <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle-btn"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-[#cfc4c5] hover:text-[#00F2FF] hover:bg-[#1f1f1f] border border-[#2C2E33]"
          aria-label="Toggle Threat Navigation"
        >
          <span className="material-symbols-outlined text-[20px]">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Extinction Probability meter */}
        <div
          id="extinction-probability-meter"
          className="flex flex-col cursor-pointer group"
          onClick={() => onSelectNavTab('global-stats')}
          title="Click to open Gemini AI Extinction Probability breakdown"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-[#757575] group-hover:text-[#00F2FF] transition-colors">
              EXTINCTION_RISK
            </span>
            <span className="hidden sm:inline-block text-[9px] px-1 py-0.2 bg-[#00F2FF]/10 text-[#00F2FF] border border-[#00F2FF]/40 rounded-xs font-mono font-bold">
              GEMINI AI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 sm:w-24 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF3B30] shadow-[0_0_8px_rgba(255,59,48,0.7)] transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(2, extinctionProbability))}%` }}
              ></div>
            </div>
            <span className="text-[12px] sm:text-[13px] font-mono text-[#FF3B30] font-bold">
              {extinctionProbability.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Kardashev Scale Indicator Widget */}
        <div
          id="kardashev-scale-header-widget"
          onClick={() => onSelectNavTab(activeNavTab === 'kardashev-scale' ? 'threat-view' : 'kardashev-scale')}
          className={`flex flex-col cursor-pointer group px-2 sm:px-2.5 py-1 border transition-all ${
            activeNavTab === 'kardashev-scale'
              ? 'border-[#00F2FF] bg-[#00F2FF]/10'
              : 'border-[#2C2E33] bg-[#141414] hover:border-[#00F2FF]/60'
          }`}
          title="Click to open Kardashev Scale Telemetry & Time to Type I Ascension"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-[#00F2FF] group-hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] sm:text-[14px]">solar_power</span>
              KARDASHEV: {kardashevRating.toFixed(2)}
            </span>
            <span className="text-[9px] px-1 py-0.2 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 rounded-xs font-mono font-bold hidden sm:inline">
              TYPE 0
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[9px] font-mono text-[#cfc4c5]">
              ETA TYPE I: <span className="text-[#39FF14] font-bold">~2357 (+331y)</span>
            </span>
          </div>
        </div>

        {/* Global Navigation links */}
        <nav className="hidden xl:flex gap-5 lg:gap-6 text-[12px] font-mono">
          <button
            id="nav-btn-kardashev"
            onClick={() => onSelectNavTab(activeNavTab === 'kardashev-scale' ? 'threat-view' : 'kardashev-scale')}
            className={`transition-colors uppercase tracking-wider py-1 ${
              activeNavTab === 'kardashev-scale'
                ? 'text-[#00F2FF] border-b-2 border-[#00F2FF] font-bold'
                : 'text-[#cfc4c5] hover:text-[#e2e2e2]'
            }`}
          >
            KARDASHEV SCALE
          </button>
          <button
            id="nav-btn-global-stats"
            onClick={() => onSelectNavTab(activeNavTab === 'global-stats' ? 'threat-view' : 'global-stats')}
            className={`transition-colors uppercase tracking-wider py-1 ${
              activeNavTab === 'global-stats'
                ? 'text-[#00F2FF] border-b-2 border-[#00F2FF] font-bold'
                : 'text-[#cfc4c5] hover:text-[#e2e2e2]'
            }`}
          >
            GLOBAL STATS
          </button>
          <button
            id="nav-btn-threat-matrix"
            onClick={() => onSelectNavTab(activeNavTab === 'threat-matrix' ? 'threat-view' : 'threat-matrix')}
            className={`transition-colors uppercase tracking-wider py-1 ${
              activeNavTab === 'threat-matrix'
                ? 'text-[#00F2FF] border-b-2 border-[#00F2FF] font-bold'
                : 'text-[#cfc4c5] hover:text-[#e2e2e2]'
            }`}
          >
            THREAT MATRIX
          </button>
          <button
            id="nav-btn-satellite-feeds"
            onClick={() => onSelectNavTab(activeNavTab === 'satellite-feeds' ? 'threat-view' : 'satellite-feeds')}
            className={`transition-colors uppercase tracking-wider py-1 ${
              activeNavTab === 'satellite-feeds'
                ? 'text-[#00F2FF] border-b-2 border-[#00F2FF] font-bold'
                : 'text-[#cfc4c5] hover:text-[#e2e2e2]'
            }`}
          >
            SATELLITE
          </button>
          {onJumpToDiscussions && (
            <button
              id="nav-btn-comms-discussions"
              onClick={onJumpToDiscussions}
              className="text-[#00F2FF] hover:text-white transition-colors uppercase tracking-wider py-1 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FF] animate-pulse"></span>
              COMMS & DISQUS
            </button>
          )}
        </nav>
      </div>

      {/* Operator Details & Profile */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div
          id="operator-profile-trigger"
          onClick={onOpenOperatorModal}
          className="flex flex-col items-end cursor-pointer group"
          title="Click to view Operator Credentials & Audit Log"
        >
          <span className="text-[11px] font-mono font-bold text-[#00F2FF] tracking-wider group-hover:underline">
            {operatorId}
          </span>
          <span className="text-[10px] font-mono text-[#cfc4c5]">
            {operatorClearance}
          </span>
        </div>
        <button
          id="operator-avatar-btn"
          onClick={onOpenOperatorModal}
          className="w-9 h-9 sm:w-10 sm:h-10 border border-[#2C2E33] bg-[#2a2a2a] hover:border-[#00F2FF] flex items-center justify-center transition-colors"
          aria-label="Open Operator Console"
        >
          <span className="material-symbols-outlined text-[#e2e2e2] text-[18px] sm:text-[20px]">
            person
          </span>
        </button>
      </div>
    </header>
  );
};
