import React, { useState, useMemo } from 'react';
import { WildfireEvent } from '../../types';

interface WildfireViewProps {
  wildfires: WildfireEvent[];
  onSelectWildfire: (wf: WildfireEvent) => void;
  isLoading?: boolean;
  feedSource?: 'NASA_EONET_LIVE' | 'TELEMETRY_CATALOG' | 'TELEMETRY_FALLBACK';
  daysWindow?: number;
  statusFilter?: string;
  onFetchDaysWindow?: (days: number, status?: string) => void;
  onLoadFallbackCatalog?: () => void;
  onRefresh?: () => void;
  apiMessage?: string;
}

export const WildfireView: React.FC<WildfireViewProps> = ({
  wildfires,
  onSelectWildfire,
  isLoading = false,
  feedSource = 'NASA_EONET_LIVE',
  daysWindow = 60,
  statusFilter = 'open',
  onFetchDaysWindow,
  onLoadFallbackCatalog,
  onRefresh,
  apiMessage,
}) => {
  const [thermalMode, setThermalMode] = useState<'INFRARED' | 'VISIBLE'>('INFRARED');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE'>('ALL');
  const [selectedDays, setSelectedDays] = useState<number>(daysWindow);
  const [activeStatus, setActiveStatus] = useState<string>(statusFilter);

  const handleDaysChange = (days: number) => {
    setSelectedDays(days);
    if (onFetchDaysWindow) {
      onFetchDaysWindow(days, activeStatus);
    }
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
    if (onFetchDaysWindow) {
      onFetchDaysWindow(selectedDays, status);
    }
  };

  // Filtered wildfires for table and map
  const filteredWildfires = useMemo(() => {
    return wildfires.filter((fire) => {
      const matchesSearch =
        fire.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        fire.code.toLowerCase().includes(tableSearch.toLowerCase()) ||
        fire.affectedZones.some((z) => z.toLowerCase().includes(tableSearch.toLowerCase())) ||
        (fire.description && fire.description.toLowerCase().includes(tableSearch.toLowerCase()));

      if (!matchesSearch) return false;

      if (severityFilter === 'CRITICAL') return fire.riskIndex >= 8.5;
      if (severityFilter === 'HIGH') return fire.riskIndex >= 7.0 && fire.riskIndex < 8.5;
      if (severityFilter === 'MODERATE') return fire.riskIndex < 7.0;
      return true;
    });
  }, [wildfires, tableSearch, severityFilter]);

  // Aggregate Metrics
  const totalBurnAreaHa = useMemo(() => {
    return wildfires.reduce((acc, curr) => acc + (curr.areaHa || 0), 0);
  }, [wildfires]);

  const maxExposureAqi = useMemo(() => {
    if (wildfires.length === 0) return 0;
    return Math.max(...wildfires.map((w) => w.aqiContribution || 0));
  }, [wildfires]);

  const criticalCount = useMemo(() => {
    return wildfires.filter((w) => w.riskIndex >= 8.5).length;
  }, [wildfires]);

  const highCount = useMemo(() => {
    return wildfires.filter((w) => w.riskIndex >= 7.0 && w.riskIndex < 8.5).length;
  }, [wildfires]);

  const handleExportDataset = () => {
    if (wildfires.length === 0) return;
    const headers = ['FIRE_ID', 'NAME', 'AFFECTED_ZONES', 'EST_DATE_RANGE', 'AREA_HA', 'RISK_INDEX', 'STATUS', 'AQI_CONTRIBUTION', 'LATITUDE', 'LONGITUDE'];
    const rows = wildfires.map((w) => [
      `"${w.code}"`,
      `"${w.name.replace(/"/g, '""')}"`,
      `"${w.affectedZones.join('; ')}"`,
      `"${w.dateRange}"`,
      w.areaHa,
      w.riskIndex,
      `"${w.status}"`,
      w.aqiContribution,
      w.coordinates ? w.coordinates[0] : 0,
      w.coordinates ? w.coordinates[1] : 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `doomsday_wildfire_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="wildfire-view" className="flex flex-col w-full p-4 sm:p-6 lg:p-8 gap-6 sm:gap-8 bg-[#131313] min-h-full text-[#e2e2e2]">
      {/* Hero / Main Title Block & Telemetry Bar */}
      <div className="flex flex-col gap-4 border-b border-[#2C2E33] pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#FF3B30] text-[32px]">local_fire_department</span>
              <h1 className="text-[32px] sm:text-[42px] font-headline font-black text-[#FF3B30] uppercase tracking-tighter leading-none">
                Wildfire Trajectory
              </h1>
            </div>
            <p className="text-[13px] font-mono text-[#cfc4c5]">
              Real-time thermal satellite detection & pyrocumulonimbus atmospheric injection monitoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1f1f1f] border border-[#2C2E33]">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-[#FFCC00] animate-ping' : feedSource === 'NASA_EONET_LIVE' ? 'bg-[#39FF14] animate-pulse' : 'bg-[#FFCC00]'}`} />
              <span className="text-[11px] font-mono font-bold text-[#e2e2e2]">
                {feedSource === 'NASA_EONET_LIVE' ? 'SOURCE: NASA EONET v2.1 (LIVE)' : 'SOURCE: DEFENSE TELEMETRY CATALOG'}
              </span>
            </div>

            <button
              id="refresh-wildfire-feed-btn"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#353535] border border-[#2C2E33] hover:border-[#00F2FF] text-[11px] font-mono font-bold text-[#00F2FF] transition-all disabled:opacity-50"
              title="Re-synchronize with NASA EONET"
            >
              <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>sync</span>
              {isLoading ? 'SYNCING...' : 'REFRESH FEED'}
            </button>
          </div>
        </div>

        {/* Observation Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-[#757575] uppercase">Observation Window:</span>
            {[30, 60, 90, 180, 365].map((days) => (
              <button
                key={days}
                id={`wildfire-days-${days}-btn`}
                onClick={() => handleDaysChange(days)}
                className={`px-2.5 py-1 text-[11px] font-mono font-bold border transition-colors ${
                  selectedDays === days
                    ? 'bg-[#FF3B30] text-white border-[#FF3B30]'
                    : 'bg-[#1a1a1a] text-[#cfc4c5] border-[#2C2E33] hover:border-[#FF3B30]'
                }`}
              >
                {days}D
              </button>
            ))}

            <div className="h-4 w-px bg-[#2C2E33] mx-1" />

            <span className="text-[11px] font-mono text-[#757575] uppercase">Status:</span>
            <button
              id="wildfire-status-open-btn"
              onClick={() => handleStatusChange('open')}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold border transition-colors ${
                activeStatus === 'open'
                  ? 'bg-[#00F2FF] text-black border-[#00F2FF]'
                  : 'bg-[#1a1a1a] text-[#cfc4c5] border-[#2C2E33] hover:border-[#00F2FF]'
              }`}
            >
              ACTIVE (OPEN)
            </button>
            <button
              id="wildfire-status-all-btn"
              onClick={() => handleStatusChange('all')}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold border transition-colors ${
                activeStatus === 'all'
                  ? 'bg-[#00F2FF] text-black border-[#00F2FF]'
                  : 'bg-[#1a1a1a] text-[#cfc4c5] border-[#2C2E33] hover:border-[#00F2FF]'
              }`}
            >
              ALL INCIDENTS
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#2a2a2a] border-l-2 border-[#FF3B30] text-[11px] font-mono font-bold text-[#cfc4c5]">
              ACTIVE DETECTIONS: {wildfires.length}
            </span>
            <span className="px-2.5 py-1 bg-[#2a2a2a] border-l-2 border-[#00F2FF] text-[11px] font-mono font-bold text-[#cfc4c5]">
              CRITICAL: {criticalCount}
            </span>
          </div>
        </div>
      </div>

      {/* USER-FRIENDLY EMPTY STATE NOTIFICATION (When NASA returns no data) */}
      {wildfires.length === 0 && !isLoading && (
        <div id="wildfire-empty-state-notice" className="w-full bg-[#1b1b1b] border-2 border-[#FFCC00] p-6 sm:p-8 flex flex-col gap-6 shadow-[0_0_20px_rgba(255,204,0,0.15)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-[#FFCC00]/10 border border-[#FFCC00] text-[#FFCC00] shrink-0">
              <span className="material-symbols-outlined text-[36px]">satellite_alt</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-[#FFCC00]/20 text-[#FFCC00] font-mono text-[10px] font-bold border border-[#FFCC00]">
                  NASA EONET v2.1 NOTICE
                </span>
                <span className="text-[11px] font-mono text-[#757575]">
                  CATEGORY 8 // WILDFIRES
                </span>
              </div>
              <h2 className="text-[20px] sm:text-[24px] font-headline font-bold text-[#e2e2e2]">
                NO ACTIVE WILDFIRES REPORTED IN THIS TIMEFRAME
              </h2>
              <p className="text-[13px] font-mono text-[#cfc4c5] mt-1.5 leading-relaxed">
                {apiMessage || `NASA's Earth Observatory Natural Event Tracker (EONET) currently reports 0 active wildfire incidents matching your observation filters (within the past ${selectedDays} days). NASA satellite thermal sweeps update continuously as new hotspot infrared anomalies are cataloged.`}
              </p>
            </div>
          </div>

          <div className="bg-[#141414] p-4 border border-[#2C2E33] flex flex-col gap-3">
            <span className="text-[11px] font-mono font-bold text-[#00F2FF] uppercase tracking-wider">
              SUGGESTED OPERATIONAL ACTIONS:
            </span>
            <div className="flex flex-wrap gap-3">
              <button
                id="empty-state-expand-180d-btn"
                onClick={() => handleDaysChange(180)}
                className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#353535] border border-[#00F2FF] text-[11px] font-mono font-bold text-[#00F2FF] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">date_range</span>
                EXPAND TO 180 DAYS
              </button>

              <button
                id="empty-state-expand-365d-btn"
                onClick={() => handleDaysChange(365)}
                className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#353535] border border-[#2C2E33] hover:border-[#00F2FF] text-[11px] font-mono font-bold text-[#e2e2e2] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                EXPAND TO FULL YEAR (365D)
              </button>

              {onLoadFallbackCatalog && (
                <button
                  id="empty-state-load-catalog-btn"
                  onClick={onLoadFallbackCatalog}
                  className="px-4 py-2 bg-[#FF3B30]/20 hover:bg-[#FF3B30]/30 border border-[#FF3B30] text-[11px] font-mono font-bold text-[#FF3B30] transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">dataset</span>
                  LOAD CURATED PLANETARY CATALOG
                </button>
              )}

              <button
                id="empty-state-retry-btn"
                onClick={onRefresh}
                className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2C2E33] text-[11px] font-mono font-bold text-[#cfc4c5] hover:text-[#e2e2e2] transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                RE-SYNC NASA EONET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="w-full bg-[#1b1b1b] border border-[#00F2FF] p-8 flex items-center justify-center gap-4 text-[#00F2FF] font-mono text-[13px]">
          <span className="material-symbols-outlined text-[28px] animate-spin">sync</span>
          <span>CONNECTING TO NASA EONET TELEMETRY SERVICE (CATEGORY 8 - WILDFIRES)...</span>
        </div>
      )}

      {/* Satellite Overview & AQI Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-[#2C2E33]">
        {/* Satellite View */}
        <div className="col-span-12 lg:col-span-8 bg-[#131313] p-4 sm:p-6 flex flex-col gap-4 relative group">
          <div className="flex flex-wrap justify-between items-center z-10 relative gap-2">
            <div>
              <h2 className="font-headline font-bold text-[18px] sm:text-[20px] text-[#e2e2e2]">
                ORBITAL IMAGERY_THERMAL
              </h2>
              <span className="text-[11px] font-mono text-[#757575]">
                {wildfires.length > 0
                  ? `PLOTTING ${Math.min(wildfires.length, 25)} ACTIVE THERMAL HOTSPOTS`
                  : 'RADAR SWEEP NOMINAL // ZERO ACTIVE SATELLITE ANOMALIES'}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                id="thermal-infrared-btn"
                onClick={() => setThermalMode('INFRARED')}
                className={`px-3 py-1 text-[11px] font-mono font-bold border transition-colors ${
                  thermalMode === 'INFRARED'
                    ? 'bg-[#00F2FF] text-[#000000] border-[#00F2FF]'
                    : 'bg-transparent text-[#cfc4c5] border-[#2C2E33] hover:border-[#00F2FF]'
                }`}
              >
                INFRARED
              </button>
              <button
                id="thermal-visible-btn"
                onClick={() => setThermalMode('VISIBLE')}
                className={`px-3 py-1 text-[11px] font-mono font-bold border transition-colors ${
                  thermalMode === 'VISIBLE'
                    ? 'bg-[#00F2FF] text-[#000000] border-[#00F2FF]'
                    : 'bg-transparent text-[#cfc4c5] border-[#2C2E33] hover:border-[#00F2FF]'
                }`}
              >
                VISIBLE
              </button>
            </div>
          </div>

          <div className="w-full h-[380px] sm:h-[420px] relative border border-[#2C2E33] overflow-hidden bg-[#0e0e0e]">
            {/* Satellite Background image */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
                thermalMode === 'INFRARED'
                  ? 'grayscale-0 opacity-100 mix-blend-screen'
                  : 'grayscale opacity-70 mix-blend-luminosity'
              }`}
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCbgJ66Z1m_iJ-QkcOqVzxNeRwLBEM--WhOPDYeIU0dbWafIYhAG5pCQnlfVcnZyubb8gMQEypc7j1LHTDPIP_1ng8pV5_XvN9UclG1noqr6ifzDAwv-c9-R_OXsJjwNGlRnMziIwI-aTyo8AjCK_4HVIOoKGaXU40yOEigpyK8JdCGtVmRx-WS94zgYAZaF_vC2D_hVh2kHwUJkmY7ttm5Ogz_pzaQ1Ud-VTkVVskvnek0GDWMy0KP')`,
              }}
            />

            {/* Overlay Grids */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(44,46,51,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(44,46,51,0.25)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Dynamic Map Hotspot Markers */}
            {wildfires.slice(0, 25).map((fire, idx) => {
              // Calculate screen coordinates based on latitude & longitude
              const lat = fire.coordinates ? fire.coordinates[0] : 35;
              const lon = fire.coordinates ? fire.coordinates[1] : -100;
              
              // Project lon (-180 to 180) -> 5% to 95%
              const leftPercent = Math.max(6, Math.min(94, ((lon + 180) / 360) * 100));
              // Project lat (-90 to 90) -> 95% to 5%
              const topPercent = Math.max(8, Math.min(92, ((90 - lat) / 180) * 100));

              const isCritical = fire.riskIndex >= 8.5;
              const isHigh = fire.riskIndex >= 7.0 && fire.riskIndex < 8.5;
              const markerColor = isCritical ? '#FF3B30' : isHigh ? '#FFCC00' : '#00F2FF';

              return (
                <div
                  key={fire.id || idx}
                  id={`wildfire-map-hotspot-${fire.id}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/hotspot z-20"
                  style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                  onClick={() => onSelectWildfire(fire)}
                  title={`${fire.code}: ${fire.name}`}
                >
                  <div
                    className="w-4 h-4 rounded-full animate-ping opacity-75 absolute -inset-0.5"
                    style={{ backgroundColor: markerColor }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-black shadow-[0_0_10px_rgba(255,59,48,0.8)] relative"
                    style={{ backgroundColor: markerColor }}
                  />

                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover/hotspot:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1b1b1b] border border-[#2C2E33] px-2.5 py-1 whitespace-nowrap z-30 shadow-xl pointer-events-none">
                    <span className="text-[11px] font-mono font-bold block" style={{ color: markerColor }}>
                      {fire.code} // RISK: {fire.riskIndex}
                    </span>
                    <span className="text-[10px] font-mono text-[#cfc4c5] block max-w-[200px] truncate">
                      {fire.name}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Empty State overlay on radar if 0 fires */}
            {wildfires.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs p-6 text-center">
                <span className="material-symbols-outlined text-[#757575] text-[48px] mb-2">radar</span>
                <span className="text-[14px] font-mono font-bold text-[#e2e2e2] uppercase">
                  ZERO ACTIVE SATELLITE THERMAL DETECTIONS
                </span>
                <span className="text-[12px] font-mono text-[#757575] mt-1 max-w-md">
                  No active wildfire fronts reported by NASA EONET within the past {selectedDays} days.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Air Quality Trends & Exposure Metrics */}
        <div className="col-span-12 lg:col-span-4 bg-[#131313] p-4 sm:p-6 flex flex-col justify-between gap-6">
          <div>
            <h2 className="font-headline font-bold text-[18px] sm:text-[20px] text-[#e2e2e2]">
              AQI TREND_ANALYSIS
            </h2>
            <p className="text-[13px] font-mono text-[#cfc4c5] mt-1">
              Particulate matter density forecasting & plume projection.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#1a1a1a] border border-[#2C2E33]">
                <span className="text-[10px] font-mono text-[#757575] uppercase block">TOTAL DETECTIONS</span>
                <span className="font-headline font-bold text-[22px] text-[#e2e2e2]">{wildfires.length}</span>
              </div>
              <div className="p-3 bg-[#1a1a1a] border border-[#2C2E33]">
                <span className="text-[10px] font-mono text-[#757575] uppercase block">CRITICAL INCIDENTS</span>
                <span className="font-headline font-bold text-[22px] text-[#FF3B30]">{criticalCount}</span>
              </div>
              <div className="p-3 bg-[#1a1a1a] border border-[#2C2E33] col-span-2">
                <span className="text-[10px] font-mono text-[#757575] uppercase block">EST. BURN PERIMETER</span>
                <span className="font-headline font-bold text-[20px] text-[#FFCC00]">
                  {totalBurnAreaHa.toLocaleString()} <span className="text-[13px] text-[#cfc4c5] font-mono">Ha</span>
                </span>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="w-full h-32 relative flex items-end justify-between border-l border-b border-[#2C2E33] pl-2 pb-2">
              <svg
                className="absolute inset-0 w-full h-full text-[#00F2FF] stroke-current"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path
                  d="M0 80 Q 20 70, 40 90 T 80 40 T 100 20"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M0 80 Q 20 70, 40 90 T 80 40 T 100 20 L 100 100 L 0 100 Z"
                  fill="currentColor"
                  fillOpacity="0.1"
                  stroke="none"
                />
                <line
                  stroke="rgba(255,59,48,0.6)"
                  strokeDasharray="3,3"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  x1="0"
                  x2="100"
                  y1="50"
                  y2="50"
                />
              </svg>

              <div className="flex flex-col items-center z-10 w-1/4">
                <span className="text-[10px] font-mono font-bold text-[#cfc4c5]">T-0</span>
              </div>
              <div className="flex flex-col items-center z-10 w-1/4">
                <span className="text-[10px] font-mono font-bold text-[#cfc4c5]">T+1</span>
              </div>
              <div className="flex flex-col items-center z-10 w-1/4">
                <span className="text-[10px] font-mono font-bold text-[#cfc4c5]">T+2</span>
              </div>
              <div className="flex flex-col items-center z-10 w-1/4">
                <span className="text-[10px] font-mono font-bold text-[#00F2FF]">T+3</span>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2a] border border-[#FF3B30] p-4 shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono font-bold text-[#FF3B30] uppercase">
                MAX EXPOSURE INDEX
              </span>
              <span className="font-headline font-bold text-[24px] text-[#FF3B30]">
                {maxExposureAqi > 0 ? maxExposureAqi : 'NOMINAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2C2E33] pb-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline font-bold text-[22px] sm:text-[26px] text-[#e2e2e2] uppercase">
              ACTIVE & PREDICTED WILDFIRE EVENTS
            </h2>
            <span className="text-[11px] font-mono text-[#757575]">
              SHOWING {filteredWildfires.length} OF {wildfires.length} SATELLITE DETECTIONS
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                id="wildfire-search-input"
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="SEARCH FIRE ID / REGION..."
                className="bg-[#1a1a1a] border border-[#2C2E33] focus:border-[#00F2FF] text-[12px] font-mono text-[#e2e2e2] px-3 py-1.5 pl-8 w-48 sm:w-64 focus:outline-none"
              />
              <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-[#757575]">
                search
              </span>
              {tableSearch && (
                <button
                  onClick={() => setTableSearch('')}
                  className="absolute right-2 top-2 text-[#757575] hover:text-[#e2e2e2]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1">
              {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE'] as const).map((sev) => (
                <button
                  key={sev}
                  id={`wildfire-filter-${sev.toLowerCase()}-btn`}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold border transition-colors ${
                    severityFilter === sev
                      ? 'bg-[#00F2FF] text-black border-[#00F2FF]'
                      : 'bg-[#1a1a1a] text-[#cfc4c5] border-[#2C2E33] hover:border-[#00F2FF]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <button
              id="export-wildfire-dataset-btn"
              onClick={handleExportDataset}
              disabled={wildfires.length === 0}
              className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#00F2FF] hover:text-[#e2e2e2] transition-colors border border-[#2C2E33] hover:border-[#00F2FF] px-3 py-1.5 bg-[#1a1a1a] disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              EXPORT CSV
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto border border-[#2C2E33] bg-[#131313]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#1f1f1f] border-b border-[#2C2E33]">
                <th className="p-4 text-[11px] font-mono font-bold text-[#cfc4c5] uppercase tracking-wider">
                  Fire ID / Location
                </th>
                <th className="p-4 text-[11px] font-mono font-bold text-[#cfc4c5] uppercase tracking-wider">
                  Affected Zones
                </th>
                <th className="p-4 text-[11px] font-mono font-bold text-[#cfc4c5] uppercase tracking-wider">
                  Observation Date
                </th>
                <th className="p-4 text-[11px] font-mono font-bold text-[#cfc4c5] uppercase tracking-wider">
                  Est. Area (Ha)
                </th>
                <th className="p-4 text-[11px] font-mono font-bold text-[#cfc4c5] uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-[11px] font-mono font-bold text-[#cfc4c5] uppercase tracking-wider text-right">
                  Risk Index
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2E33]">
              {filteredWildfires.length > 0 ? (
                filteredWildfires.map((fire) => {
                  const isCritical = fire.riskIndex >= 8.5;
                  const isHigh = fire.riskIndex >= 7.0 && fire.riskIndex < 8.5;
                  const isModerate = fire.riskIndex < 7.0;

                  const leftBorder = isCritical
                    ? 'bg-[#FF3B30] shadow-[0_0_8px_rgba(255,59,48,0.8)]'
                    : isHigh
                    ? 'bg-[#FFCC00]'
                    : 'bg-[#00F2FF]';

                  const barFillColor = isCritical
                    ? 'bg-[#FF3B30]'
                    : isHigh
                    ? 'bg-[#FFCC00]'
                    : 'bg-[#00F2FF]';

                  const scoreColor = isCritical
                    ? 'text-[#FF3B30] font-bold'
                    : isHigh
                    ? 'text-[#FFCC00]'
                    : 'text-[#00F2FF]';

                  return (
                    <tr
                      key={fire.id}
                      id={`wildfire-row-${fire.id}`}
                      onClick={() => onSelectWildfire(fire)}
                      className={`hover:bg-[#2a2a2a] group transition-colors relative cursor-crosshair ${
                        isModerate ? 'opacity-80 hover:opacity-100' : ''
                      }`}
                    >
                      <td className="p-4 relative">
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${leftBorder} opacity-0 group-hover:opacity-100 transition-opacity`}
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[14px] font-mono font-bold ${
                                isCritical ? 'text-[#FF3B30]' : 'text-[#e2e2e2]'
                              }`}
                            >
                              {fire.code}
                            </span>
                            {fire.link && (
                              <a
                                href={fire.link}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[#757575] hover:text-[#00F2FF]"
                                title="NASA EONET Event Page"
                              >
                                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              </a>
                            )}
                          </div>
                          <span className="text-[12px] font-mono text-[#cfc4c5] line-clamp-1">
                            {fire.name}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {fire.affectedZones.map((zone, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 border border-[#2C2E33] bg-[#1a1a1a] text-[10px] font-mono font-bold text-[#cfc4c5]"
                            >
                              {zone}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 text-[12px] font-mono text-[#e2e2e2]">
                        {fire.dateRange}
                      </td>

                      <td className="p-4 text-[12px] font-mono text-[#e2e2e2]">
                        {fire.areaHa.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                            isCritical
                              ? 'border-[#FF3B30] text-[#FF3B30] bg-[#FF3B30]/10'
                              : isHigh
                              ? 'border-[#FFCC00] text-[#FFCC00] bg-[#FFCC00]/10'
                              : 'border-[#00F2FF] text-[#00F2FF] bg-[#00F2FF]/10'
                          }`}
                        >
                          {fire.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-3">
                          <div className="w-16 h-1.5 bg-[#2a2a2a] overflow-hidden">
                            <div
                              className={`h-full ${barFillColor}`}
                              style={{ width: `${Math.min(100, fire.riskIndex * 10)}%` }}
                            />
                          </div>
                          <span className={`text-[13px] font-mono ${scoreColor}`}>
                            {fire.riskIndex.toFixed(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#757575] font-mono text-[13px]">
                    {wildfires.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[32px] text-[#FFCC00]">info</span>
                        <span className="text-[#e2e2e2] font-bold">NO WILDFIRE DATA AVAILABLE FROM NASA EONET</span>
                        <span className="text-[11px] text-[#757575] max-w-md">
                          Try expanding the observation window or load the curated baseline planetary defense dataset.
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span>NO WILDFIRES MATCH FILTER CRITERIA</span>
                        <button
                          onClick={() => {
                            setTableSearch('');
                            setSeverityFilter('ALL');
                          }}
                          className="text-[11px] text-[#00F2FF] hover:underline"
                        >
                          RESET FILTERS
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
