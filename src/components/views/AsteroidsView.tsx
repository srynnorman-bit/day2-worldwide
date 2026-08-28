import React, { useState, useMemo } from 'react';
import { AsteroidObject, MonitoringFeedItem } from '../../types';

interface AsteroidsViewProps {
  asteroids: AsteroidObject[];
  monitoringFeeds: MonitoringFeedItem[];
  extinctionProbability: number;
  onUpdateExtinctionProbability: (val: number) => void;
  onSelectAsteroid: (asteroid: AsteroidObject) => void;
  isLoadingLiveFeed?: boolean;
  feedSource?: 'NASA_NEOWS_LIVE' | 'TELEMETRY_FALLBACK';
  startDate?: string;
  endDate?: string;
  onFetchDateRange?: (start: string, end: string) => void;
  totalElementCount?: number;
}

export const AsteroidsView: React.FC<AsteroidsViewProps> = ({
  asteroids,
  monitoringFeeds,
  extinctionProbability,
  onUpdateExtinctionProbability,
  onSelectAsteroid,
  isLoadingLiveFeed = false,
  feedSource = 'NASA_NEOWS_LIVE',
  startDate = new Date().toISOString().split('T')[0],
  endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  onFetchDateRange,
  totalElementCount,
}) => {
  const [selectedFeedFilter, setSelectedFeedFilter] = useState<'ALL' | 'CRITICAL' | 'NEW' | 'SYSTEM'>('ALL');
  const [activeOrbitalTarget, setActiveOrbitalTarget] = useState<string>('99942 Apophis');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [threatFilter, setThreatFilter] = useState<string>('ALL');

  const [inputStartDate, setInputStartDate] = useState<string>(startDate);
  const [inputEndDate, setInputEndDate] = useState<string>(endDate);

  const handleApplyDateRange = () => {
    if (onFetchDateRange) {
      onFetchDateRange(inputStartDate, inputEndDate);
    }
  };

  const currentTargetObj = useMemo(() => {
    return (
      asteroids.find((a) => a.objectId.includes(activeOrbitalTarget) || a.name.includes(activeOrbitalTarget)) ||
      asteroids[0] ||
      {
        objectId: '99942',
        name: '99942 Apophis (2004 MN4)',
        velocityKmS: 30.73,
        missDistKm: 31600,
        missDistAu: 0.00021,
        estDiaMinM: 340,
        estDiaMaxM: 370,
        threatLevel: 'EXTREME',
        timeToApproach: 'T - 3Y 229D',
        ra: '09h 14m 22s',
        dec: '+16° 44\' 18"',
        orbitPeriodDays: 323.6,
        eccentricity: 0.191,
        inclinationDeg: 3.33,
        hazardous: true,
      }
    );
  }, [asteroids, activeOrbitalTarget]);

  const filteredFeeds = useMemo(() => {
    return monitoringFeeds.filter((feed) => {
      if (selectedFeedFilter === 'ALL') return true;
      if (selectedFeedFilter === 'CRITICAL') return feed.tagType === 'emergency';
      if (selectedFeedFilter === 'NEW') return feed.tagType === 'cyan' || feed.tag === 'LD < 1.0';
      if (selectedFeedFilter === 'SYSTEM') return feed.tagType === 'system';
      return true;
    });
  }, [monitoringFeeds, selectedFeedFilter]);

  const filteredAsteroids = useMemo(() => {
    return asteroids.filter((a) => {
      const matchSearch =
        a.objectId.toLowerCase().includes(tableSearch.toLowerCase()) ||
        a.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        a.approachDateUtc.toLowerCase().includes(tableSearch.toLowerCase());
      const matchThreat = threatFilter === 'ALL' || a.threatLevel === threatFilter;
      return matchSearch && matchThreat;
    });
  }, [asteroids, tableSearch, threatFilter]);

  const handleExportCSV = () => {
    const headers = ['OBJECT_ID', 'NAME', 'APPROACH_DATE_UTC', 'VELOCITY_KM_S', 'MISS_DIST_KM', 'EST_DIA_M', 'THREAT_LEVEL', 'HAZARDOUS'];
    const rows = filteredAsteroids.map((a) => [
      `"${a.objectId}"`,
      `"${a.name}"`,
      `"${a.approachDateUtc}"`,
      a.velocityKmS,
      a.missDistKm,
      `"${a.estDiaMinM} - ${a.estDiaMaxM}"`,
      `"${a.threatLevel}"`,
      a.hazardous ? 'TRUE' : 'FALSE',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `doomsday_asteroids_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="asteroids-view" className="flex flex-col w-full p-4 sm:p-6 lg:p-8 gap-6 sm:gap-8 bg-[#131313] text-[#e2e2e2]">
      {/* Backend API Connection & Date Feed Bar */}
      <div className="bg-[#1b1b1b] border border-[#2C2E33] p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00F2FF] shadow-[0_0_8px_#00F2FF] animate-pulse"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono font-bold text-[#00F2FF] tracking-wider uppercase">
                NASA NeoWs REST API Feed v1
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 border ${feedSource === 'NASA_NEOWS_LIVE' ? 'bg-[#00F2FF]/10 text-[#00F2FF] border-[#00F2FF]/40' : 'bg-[#FFCC00]/10 text-[#FFCC00] border-[#FFCC00]/40'}`}>
                {feedSource === 'NASA_NEOWS_LIVE' ? 'LIVE ORBITAL TELEMETRY' : 'PLANETARY DEFENSE REPOSITORY'}
              </span>
              {totalElementCount !== undefined && (
                <span className="text-[10px] font-mono text-[#cfc4c5]">
                  ({totalElementCount} NEOs Tracked)
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-[#757575] block mt-0.5">
              GET https://api.nasa.gov/neo/rest/v1/feed?start_date={inputStartDate}&end_date={inputEndDate}&api_key=API_KEY
            </span>
          </div>
        </div>

        {/* Date Range Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 bg-[#0e0e0e] border border-[#2C2E33] px-2 py-1">
            <span className="text-[10px] font-mono text-[#757575]">START:</span>
            <input
              type="date"
              value={inputStartDate}
              onChange={(e) => setInputStartDate(e.target.value)}
              className="bg-transparent text-[11px] font-mono text-[#e2e2e2] outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0e0e0e] border border-[#2C2E33] px-2 py-1">
            <span className="text-[10px] font-mono text-[#757575]">END:</span>
            <input
              type="date"
              value={inputEndDate}
              onChange={(e) => setInputEndDate(e.target.value)}
              className="bg-transparent text-[11px] font-mono text-[#e2e2e2] outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleApplyDateRange}
            disabled={isLoadingLiveFeed}
            className="px-3 py-1.5 bg-[#00F2FF]/10 hover:bg-[#00F2FF]/20 border border-[#00F2FF] text-[#00F2FF] text-[11px] font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5"
          >
            <span className={`material-symbols-outlined text-[16px] ${isLoadingLiveFeed ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {isLoadingLiveFeed ? 'SYNCING NASA...' : 'QUERY NEOWS'}
          </button>
        </div>
      </div>

      {/* Extinction Probability & Top Level Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Probability Card */}
        <div className="col-span-12 lg:col-span-4 bg-[#000000] border-l-4 border-[#FF3B30] p-6 relative overflow-hidden group border border-[#2C2E33]">
          <div className="absolute inset-0 bg-[#FF3B30]/5 pointer-events-none group-hover:bg-[#FF3B30]/10 transition-colors"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h2 className="font-headline font-bold text-[18px] sm:text-[20px] text-[#757575] uppercase tracking-widest">
              Extinction Probability
            </h2>
            <span className="material-symbols-outlined text-[#FF3B30] animate-pulse">
              warning
            </span>
          </div>

          <div className="flex items-baseline gap-3 mb-6 relative z-10">
            <span className="font-headline font-black text-[40px] sm:text-[48px] text-[#FF3B30] tracking-tight">
              {extinctionProbability.toFixed(2)}%
            </span>
            <span className="text-[12px] font-mono text-[#cfc4c5]">
              CURRENT RISK FACTOR
            </span>
          </div>

          {/* DEFCON Progress Bar with markers */}
          <div className="w-full h-3 bg-[#2a2a2a] rounded-none relative overflow-hidden z-10 border border-[#2C2E33]">
            <div
              className="absolute top-0 left-0 h-full bg-[#FF3B30] shadow-[0_0_12px_rgba(255,59,48,0.8)] transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(2, extinctionProbability))}%` }}
            ></div>
            <div className="absolute top-0 left-[25%] w-px h-full bg-[#2C2E33]"></div>
            <div className="absolute top-0 left-[50%] w-px h-full bg-[#2C2E33]"></div>
            <div className="absolute top-0 left-[75%] w-px h-full bg-[#2C2E33]"></div>
          </div>

          <div className="flex justify-between mt-2 text-[11px] font-mono font-bold text-[#cfc4c5] z-10 relative">
            <span>DEFCON 5</span>
            <span>DEFCON 1</span>
          </div>

          {/* Quick DEFCON Simulation adjustment */}
          <div className="mt-4 pt-3 border-t border-[#2C2E33] flex flex-col gap-2 text-[10px] font-mono text-[#757575]">
            <div className="flex items-center justify-between">
              <span>GEMINI AI PROBABILITY:</span>
              <div className="flex items-center gap-1">
                <span className="text-[#00F2FF] font-bold">GEMINI 3.7 FLASH</span>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => onUpdateExtinctionProbability(8.15)}
                className="px-2 py-0.5 bg-[#1b1b1b] hover:bg-[#2a2a2a] border border-[#2C2E33] text-[#cfc4c5]"
              >
                LOW
              </button>
              <button
                onClick={() => onUpdateExtinctionProbability(12.04)}
                className="px-2 py-0.5 bg-[#1b1b1b] hover:bg-[#2a2a2a] border border-[#2C2E33] text-[#00F2FF]"
              >
                BASELINE (12.04%)
              </button>
              <button
                onClick={() => onUpdateExtinctionProbability(27.8)}
                className="px-2 py-0.5 bg-[#1b1b1b] hover:bg-[#2a2a2a] border border-[#FF3B30] text-[#FF3B30]"
              >
                SPIKE
              </button>
            </div>
          </div>
        </div>

        {/* Right Stats 3-Col Block */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-1 bg-[#2C2E33]">
          <div className="bg-[#1b1b1b] p-6 flex flex-col justify-between border-t border-[#2C2E33] hover:border-[#00F2FF] transition-colors">
            <span className="text-[11px] font-mono font-bold text-[#757575] tracking-wider">
              ACTIVE NEO THREATS
            </span>
            <span className="font-headline font-bold text-[32px] text-[#e2e2e2] mt-2">
              {asteroids.length}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined text-[#FFCC00] text-[16px]">
                trending_up
              </span>
              <span className="text-[13px] font-mono text-[#FFCC00]">
                {asteroids.filter((a) => a.hazardous).length} Hazardous
              </span>
            </div>
          </div>

          <div className="bg-[#1b1b1b] p-6 flex flex-col justify-between border-t border-[#2C2E33] hover:border-[#00F2FF] transition-colors">
            <span className="text-[11px] font-mono font-bold text-[#757575] tracking-wider">
              MIN MISS DISTANCE
            </span>
            <span className="font-headline font-bold text-[32px] text-[#FF3B30] mt-2">
              {(Math.min(...asteroids.map((a) => a.missDistKm)) / 1000).toFixed(1)}k km
            </span>
            <span className="text-[11px] font-mono text-[#cfc4c5] mt-2">
              &lt; 0.1 Lunar Distance
            </span>
          </div>

          <div className="bg-[#1b1b1b] p-6 flex flex-col justify-between border-t border-[#2C2E33] hover:border-[#00F2FF] transition-colors">
            <span className="text-[11px] font-mono font-bold text-[#757575] tracking-wider">
              RADAR TRACKING NODES
            </span>
            <span className="font-headline font-bold text-[32px] text-[#00F2FF] mt-2">
              18 ACTIVE
            </span>
            <span className="text-[11px] font-mono text-[#39FF14] mt-2">
              GOLDSTONE / ARECIBO-SYNC
            </span>
          </div>
        </div>
      </div>

      {/* Main Radar & Live Monitoring Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Orbital Path Simulator & Radar */}
        <div className="col-span-12 lg:col-span-8 bg-[#000000] p-6 flex flex-col justify-between relative overflow-hidden border border-[#2C2E33] min-h-[460px]">
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#00F2FF]">
                radar
              </span>
              <span className="font-headline font-bold text-[18px] text-[#e2e2e2] uppercase tracking-wide">
                Orbital Radar & Trajectory Projection
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                id="orbital-target-selector"
                value={activeOrbitalTarget}
                onChange={(e) => setActiveOrbitalTarget(e.target.value)}
                className="bg-[#1f1f1f] border border-[#2C2E33] px-2 py-1 text-[11px] font-mono text-[#00F2FF] focus:border-[#00F2FF] outline-none cursor-pointer"
              >
                {asteroids.map((ast) => (
                  <option key={ast.objectId} value={ast.name}>
                    {ast.name} ({ast.threatLevel})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 bg-[#141414] border border-[#2C2E33] px-2 py-1 text-[11px] font-mono">
                <span className="text-[9px] text-[#757575] uppercase hidden sm:inline tracking-wider font-bold">
                  SWEEP:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    id="btn-sweep-speed-1x"
                    onClick={() => setSimulationSpeed(1)}
                    title="Real-time standard radar sweep (1×)"
                    className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                      simulationSpeed === 1
                        ? 'bg-[#00F2FF] border-[#00F2FF] text-black'
                        : 'bg-[#1f1f1f] border-[#2C2E33] text-[#cfc4c5] hover:text-white'
                    }`}
                  >
                    1× REAL-TIME
                  </button>
                  <button
                    id="btn-sweep-speed-5x"
                    onClick={() => setSimulationSpeed(5)}
                    title="Accelerated orbital projection (5×)"
                    className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                      simulationSpeed === 5
                        ? 'bg-[#00F2FF] border-[#00F2FF] text-black'
                        : 'bg-[#1f1f1f] border-[#2C2E33] text-[#cfc4c5] hover:text-white'
                    }`}
                  >
                    5× WARP
                  </button>
                  <button
                    id="btn-sweep-speed-20x"
                    onClick={() => setSimulationSpeed(20)}
                    title="High-speed time-lapse simulation (20×)"
                    className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                      simulationSpeed === 20
                        ? 'bg-[#00F2FF] border-[#00F2FF] text-black'
                        : 'bg-[#1f1f1f] border-[#2C2E33] text-[#cfc4c5] hover:text-white'
                    }`}
                  >
                    20× TIME-LAPSE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive CSS / Canvas Radar Visual */}
          <div className="relative w-full h-72 my-4 flex items-center justify-center">
            {/* Concentric Radar Range Rings */}
            <div className="absolute w-64 h-64 rounded-full border border-[#2C2E33] animate-[spin_40s_linear_infinite]"></div>
            <div className="absolute w-48 h-48 rounded-full border border-[#2C2E33]/70"></div>
            <div className="absolute w-32 h-32 rounded-full border border-[#00F2FF]/30"></div>
            <div className="absolute w-16 h-16 rounded-full border border-[#FF3B30]/40"></div>

            {/* Radar Crosshairs */}
            <div className="absolute w-full h-px bg-[#2C2E33]"></div>
            <div className="absolute h-full w-px bg-[#2C2E33]"></div>

            {/* Radar Rotating Sweep Line */}
            <div
              className="absolute w-32 h-32 origin-bottom-right top-1/2 left-1/2 -mt-32 -ml-32 pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg, rgba(0,242,255,0.25) 0deg, transparent 60deg)',
                animation: `spin ${6 / simulationSpeed}s linear infinite`,
                borderRadius: '100% 0 0 0',
              }}
            ></div>

            {/* Center Earth Node */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-[#00F2FF] shadow-[0_0_15px_#00F2FF] flex items-center justify-center text-[8px] font-bold text-black">
                ⊕
              </div>
              <span className="text-[9px] font-mono text-[#00F2FF] font-bold mt-1">
                TERRA (1.00 AU)
              </span>
            </div>

            {/* Simulated Asteroid Target Positions */}
            {asteroids.slice(0, 5).map((ast, idx) => {
              const angles = [45, 130, 210, 300, 80];
              const radii = [45, 75, 105, 60, 95];
              const angle = angles[idx % angles.length];
              const radius = radii[idx % radii.length];
              const isSelected = ast.name === currentTargetObj.name;

              return (
                <div
                  key={ast.objectId}
                  onClick={() => {
                    setActiveOrbitalTarget(ast.name);
                    onSelectAsteroid(ast);
                  }}
                  className="absolute cursor-pointer group flex flex-col items-center z-20"
                  style={{
                    transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
                  }}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#FF3B30] ring-4 ring-[#FF3B30]/40 scale-125'
                        : ast.hazardous
                        ? 'bg-[#FFCC00] animate-pulse'
                        : 'bg-[#cfc4c5]'
                    }`}
                  ></div>
                  <span className="text-[9px] font-mono text-[#e2e2e2] bg-[#0e0e0e]/90 px-1 border border-[#2C2E33] whitespace-nowrap mt-1 group-hover:text-[#00F2FF]">
                    {ast.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#2C2E33] text-[11px] font-mono z-10">
            <div>
              <span className="text-[#757575] block text-[9px]">TARGET:</span>
              <span className="text-[#00F2FF] font-bold truncate block">
                {currentTargetObj.name}
              </span>
            </div>
            <div>
              <span className="text-[#757575] block text-[9px]">VELOCITY:</span>
              <span className="text-[#e2e2e2] font-bold">
                {currentTargetObj.velocityKmS} km/s
              </span>
            </div>
            <div>
              <span className="text-[#757575] block text-[9px]">MISS DISTANCE:</span>
              <span className="text-[#FF3B30] font-bold">
                {currentTargetObj.missDistKm.toLocaleString()} km
              </span>
            </div>
            <div>
              <span className="text-[#757575] block text-[9px]">TIME TO REACH:</span>
              <span className="text-[#FFCC00] font-bold">
                {currentTargetObj.timeToApproach}
              </span>
            </div>
          </div>
        </div>

        {/* Live Feed Sidebar */}
        <div className="col-span-12 lg:col-span-4 bg-[#1f1f1f] flex flex-col border border-[#2C2E33] max-h-[460px]">
          <div className="p-4 border-b border-[#2C2E33] bg-[#2a2a2a] flex justify-between items-center">
            <span className="font-headline font-bold text-[18px] text-[#e2e2e2] uppercase tracking-wide">
              MONITORING FEED
            </span>
            
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                id="monitoring-feed-filter"
                value={selectedFeedFilter}
                onChange={(e) => setSelectedFeedFilter(e.target.value as any)}
                className="px-2 py-1 border border-[#2C2E33] bg-[#0e0e0e] text-[11px] font-mono text-[#e2e2e2] focus:border-[#00F2FF] outline-none cursor-pointer"
              >
                <option value="ALL">ALL FEEDS</option>
                <option value="CRITICAL">CRITICAL ONLY</option>
                <option value="NEW">DETECTIONS</option>
                <option value="SYSTEM">SYSTEM LOGS</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 p-2">
            {filteredFeeds.map((feed) => {
              const borderClass =
                feed.tagType === 'emergency'
                  ? 'border-l-2 border-[#FF3B30]'
                  : feed.tagType === 'warning'
                  ? 'border-l-2 border-[#FFCC00]'
                  : feed.tagType === 'cyan'
                  ? 'border-l-2 border-[#00F2FF]'
                  : 'border-l-2 border-[#2C2E33]';

              const tagColor =
                feed.tagType === 'emergency'
                  ? 'text-[#FF3B30]'
                  : feed.tagType === 'warning'
                  ? 'text-[#FFCC00]'
                  : feed.tagType === 'cyan'
                  ? 'text-[#00F2FF]'
                  : 'text-[#cfc4c5]';

              return (
                <div
                  key={feed.id}
                  className={`bg-[#131313] ${borderClass} p-3 flex flex-col gap-1 cursor-pointer hover:bg-[#1b1b1b] transition-colors relative overflow-hidden`}
                >
                  {feed.tagType === 'emergency' && (
                    <div className="absolute inset-0 bg-[#FF3B30]/5 pointer-events-none animate-pulse"></div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className={`text-[11px] font-mono font-bold ${tagColor}`}>
                      {feed.tag}
                    </span>
                    <span className="text-[10px] font-mono text-[#cfc4c5]">
                      {feed.timestamp}
                    </span>
                  </div>

                  <span className="text-[13px] font-mono text-[#e2e2e2] leading-snug">
                    {feed.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#757575] mt-1">
                    {feed.detail}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* High Density Close Approach Data Log */}
      <div className="mt-2 bg-[#131313] border border-[#2C2E33] flex flex-col">
        <div className="p-4 border-b border-[#2C2E33] bg-[#1b1b1b] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00F2FF]">
              table_chart
            </span>
            <h3 className="font-headline font-bold text-[18px] text-[#e2e2e2] uppercase tracking-widest">
              Close Approach Data Log ({filteredAsteroids.length} objects)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search filter input */}
            <input
              type="text"
              placeholder="FILTER OBJECTS..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="bg-[#0e0e0e] border border-[#2C2E33] px-3 py-1 text-[11px] font-mono text-[#e2e2e2] placeholder-[#757575] focus:border-[#00F2FF] outline-none"
            />

            <select
              value={threatFilter}
              onChange={(e) => setThreatFilter(e.target.value)}
              className="bg-[#0e0e0e] border border-[#2C2E33] px-2 py-1 text-[11px] font-mono text-[#cfc4c5] focus:border-[#00F2FF] outline-none cursor-pointer"
            >
              <option value="ALL">ALL THREATS</option>
              <option value="EXTREME">EXTREME</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="ELEVATED">ELEVATED</option>
              <option value="MODERATE">MODERATE</option>
              <option value="LOW">LOW</option>
            </select>

            <button
              id="export-asteroids-csv-btn"
              onClick={handleExportCSV}
              className="px-3 py-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2C2E33] text-[#cfc4c5] hover:text-[#00F2FF] text-[11px] font-mono flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              EXPORT CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1b1b1b] border-b border-[#2C2E33] text-[11px] font-mono text-[#757575] uppercase">
                <th className="p-4">OBJECT ID / NAME</th>
                <th className="p-4">APPROACH DATE (UTC)</th>
                <th className="p-4">VELOCITY</th>
                <th className="p-4">MISS DISTANCE</th>
                <th className="p-4">EST. DIAMETER</th>
                <th className="p-4">HAZARDOUS</th>
                <th className="p-4">THREAT LEVEL</th>
                <th className="p-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2E33] font-mono text-[12px]">
              {filteredAsteroids.map((ast) => {
                const badgeClass =
                  ast.threatLevel === 'EXTREME' || ast.threatLevel === 'CRITICAL'
                    ? 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30] animate-pulse'
                    : ast.threatLevel === 'ELEVATED'
                    ? 'bg-[#FFCC00]/20 text-[#FFCC00] border-[#FFCC00]'
                    : ast.threatLevel === 'MODERATE'
                    ? 'bg-[#00F2FF]/20 text-[#00F2FF] border-[#00F2FF]'
                    : 'bg-[#2a2a2a] text-[#cfc4c5] border-[#2C2E33]';

                return (
                  <tr
                    key={ast.objectId}
                    className="hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                    onClick={() => onSelectAsteroid(ast)}
                  >
                    <td className="p-4 font-bold text-[#e2e2e2]">
                      <div className="flex items-center gap-2">
                        <span>{ast.name}</span>
                        {ast.hazardous && (
                          <span className="px-1 py-0.2 bg-[#FF3B30]/20 text-[#FF3B30] text-[9px] border border-[#FF3B30]/50">
                            PHA
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#757575] block font-normal">
                        ID: {ast.objectId}
                      </span>
                    </td>
                    <td className="p-4 text-[#cfc4c5]">{ast.approachDateUtc}</td>
                    <td className="p-4 text-[#e2e2e2] font-semibold">{ast.velocityKmS} km/s</td>
                    <td className="p-4">
                      <span className="text-[#FF3B30] font-bold block">
                        {ast.missDistKm.toLocaleString()} km
                      </span>
                      <span className="text-[10px] text-[#757575]">
                        ({ast.missDistAu} AU)
                      </span>
                    </td>
                    <td className="p-4 text-[#cfc4c5]">
                      {ast.estDiaMinM}m - {ast.estDiaMaxM}m
                    </td>
                    <td className="p-4">
                      {ast.hazardous ? (
                        <span className="text-[#FF3B30] font-bold">YES</span>
                      ) : (
                        <span className="text-[#757575]">NO</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border ${badgeClass}`}>
                        {ast.threatLevel}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAsteroid(ast);
                        }}
                        className="px-2.5 py-1 bg-[#1f1f1f] hover:bg-[#00F2FF] hover:text-black text-[#00F2FF] border border-[#00F2FF]/40 text-[10px] font-bold tracking-wider uppercase transition-colors"
                      >
                        INSPECT
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
