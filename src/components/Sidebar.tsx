import React from 'react';
import { CATEGORY_CONFIG } from '../data/threatData';
import { ThreatCategory } from '../types';

interface SidebarProps {
  activeCategory: ThreatCategory;
  onSelectCategory: (category: ThreatCategory) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onOpenKardashev?: () => void;
}

const CATEGORIES: { id: ThreatCategory; label: string; icon: string }[] = [
  { id: 'asteroids-and-comets', label: 'ASTEROIDS & COMETS', icon: 'rocket_launch' },
  { id: 'drought', label: 'DROUGHT', icon: 'sort_by_alpha' },
  { id: 'dust-and-haze', label: 'DUST & HAZE', icon: 'blur_on' },
  { id: 'earthquakes', label: 'EARTHQUAKES', icon: 'public_off' },
  { id: 'floods', label: 'FLOODS', icon: 'tsunami' },
  { id: 'landslides', label: 'LANDSLIDES', icon: 'landscape' },
  { id: 'sea-and-lake-ice', label: 'SEA & LAKE ICE', icon: 'ac_unit' },
  { id: 'storms', label: 'STORMS', icon: 'cyclone' },
  { id: 'temperature-extremes', label: 'TEMP EXTREMES', icon: 'thermostat' },
  { id: 'volcanoes', label: 'VOLCANOES', icon: 'volcano' },
  { id: 'wildfire', label: 'WILDFIRE', icon: 'local_fire_department' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  onSelectCategory,
  mobileMenuOpen,
  onCloseMobileMenu,
  onOpenKardashev,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobileMenu}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="doomsday-sidebar"
        className={`fixed left-0 top-0 h-full w-72 bg-[#0e0e0e] border-r border-[#2C2E33] z-50 flex flex-col overflow-y-auto transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="p-6 mb-2 flex flex-col gap-2 border-b border-[#2C2E33]">
          <div className="flex items-center gap-3">
            <img
              alt="Doomsday Advisor Logo"
              className="h-8 w-8 object-contain shrink-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcLENhSGiwg0F7kSPU5dK8iM3jkr8GMalkU1jDhvMirkAqH7ByWe3I8-jg-dG8kWB7adoEYTl2mde6FgB2CEdGa68U19G3NdqHW0fLW4z97uurR_iLXDtjXNWN8SeFsOhiN92tPNx0jc8hJ4jUcLewU_8vRgLaSUGGe0VUBv1W1oeq9ZkJw5dGJvzkVpYMDdhC8bcLL9M27ssZ_eT7FKUoG3AT3Fi4-hgA8hWyt4AlFC2rMBVhm8Zb"
            />
            <span className="font-headline font-bold text-[18px] text-[#e2e2e2] uppercase tracking-widest">
              DOOMSDAY ADVISOR
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></div>
              <span className="text-[11px] font-mono font-bold text-[#39FF14] tracking-wider">
                SYSTEM_STATUS: ACTIVE
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#757575]">v4.8.2</span>
          </div>
        </div>

        {/* Threat Categories Navigation */}
        <nav
          id="category-nav-list"
          className="flex-1 px-2 space-y-1 py-2 font-mono text-[13px]"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const config = CATEGORY_CONFIG[cat.id];

            return (
              <button
                key={cat.id}
                id={`sidebar-nav-${cat.id}`}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onCloseMobileMenu();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 transition-all text-left group ${
                  isActive
                    ? 'bg-[#353535] border-l-2 border-[#00F2FF] text-[#00F2FF] font-bold'
                    : 'text-[#cfc4c5] hover:bg-[#1f1f1f] hover:text-[#e2e2e2] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center truncate">
                  <span
                    className={`material-symbols-outlined mr-3 text-[18px] transition-colors ${
                      isActive
                        ? 'text-[#00F2FF]'
                        : 'text-[#cfc4c5] group-hover:text-[#e2e2e2]'
                    }`}
                  >
                    {cat.icon}
                  </span>
                  <span className="truncate tracking-wider text-[12px] sm:text-[13px]">
                    {cat.label}
                  </span>
                </div>

                {config && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 border ${
                      isActive
                        ? 'border-[#00F2FF]/40 text-[#00F2FF] bg-[#00F2FF]/10'
                        : 'border-[#2C2E33] text-[#757575] bg-[#131313]'
                    }`}
                  >
                    {config.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Kardashev Scale Quick Sidebar Indicator */}
        {onOpenKardashev && (
          <div className="px-3 py-2">
            <button
              onClick={() => {
                onOpenKardashev();
                onCloseMobileMenu();
              }}
              className="w-full bg-[#141414] hover:bg-[#1f1f1f] border border-[#2C2E33] hover:border-[#00F2FF] p-2.5 text-left transition-colors font-mono group"
            >
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#00F2FF] font-bold flex items-center gap-1 group-hover:underline">
                  <span className="material-symbols-outlined text-[14px]">solar_power</span>
                  KARDASHEV SCALE
                </span>
                <span className="text-[10px] text-[#39FF14] font-bold bg-[#39FF14]/10 px-1 py-0.2 border border-[#39FF14]/30">
                  0.73
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#2a2a2a] rounded-full overflow-hidden mt-1.5">
                <div className="h-full bg-gradient-to-r from-[#00F2FF] to-[#39FF14] w-[72.7%]" />
              </div>
              <div className="flex justify-between items-center text-[9px] text-[#cfc4c5] mt-1">
                <span>ETA TYPE I:</span>
                <span className="text-[#39FF14] font-bold">~2357 (+331y)</span>
              </div>
            </button>
          </div>
        )}

        {/* Sidebar Footer telemetry stats */}
        <div className="p-4 border-t border-[#2C2E33] bg-[#0e0e0e] flex flex-col gap-1.5 text-[10px] font-mono text-[#757575]">
          <div className="flex justify-between">
            <span>RADAR_BAND:</span>
            <span className="text-[#00F2FF]">KU / X-DUAL</span>
          </div>
          <div className="flex justify-between">
            <span>ORBITAL_SYNC:</span>
            <span className="text-[#39FF14]">NOMINAL (0.04s)</span>
          </div>
          <div className="flex justify-between">
            <span>GRID_NODES:</span>
            <span className="text-[#e2e2e2]">1,280 ONLINE</span>
          </div>
        </div>
      </aside>
    </>
  );
};
