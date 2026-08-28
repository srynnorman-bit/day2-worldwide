import React, { useState, useEffect } from 'react';
import { CATEGORY_CONFIG, OTHER_THREAT_RECORDS } from '../../data/threatData';
import { GeneralThreatRecord, ThreatCategory, EonetEventItem } from '../../types';
import { fetchEonetEvents } from '../../services/telemetryApi';

interface GenericThreatViewProps {
  category: ThreatCategory;
  onSelectRecord?: (record: GeneralThreatRecord) => void;
}

// Map frontend category slugs to NASA EONET Category IDs
const EONET_CATEGORY_MAP: Record<string, { id: number; title: string; link: string; description: string; layers: string }> = {
  'drought': {
    id: 6,
    title: 'Drought',
    link: 'https://eonet.gsfc.nasa.gov/api/v2.1/categories/6',
    description: 'Long lasting absence of precipitation affecting agriculture and livestock, and the overall availability of food and water.',
    layers: 'https://eonet.gsfc.nasa.gov/api/v2.1/layers/6'
  },
  'dust-and-haze': {
    id: 7,
    title: 'Dust and Haze',
    link: 'https://eonet.gsfc.nasa.gov/api/v2.1/categories/7',
    description: 'Related to dust storms, air pollution and other non-volcanic aerosols. Volcano-related plumes shall be included with the originating eruption event.',
    layers: 'https://eonet.gsfc.nasa.gov/api/v2.1/layers/7'
  },
  'earthquakes': {
    id: 16,
    title: 'Earthquakes',
    link: 'https://eonet.gsfc.nasa.gov/api/v2.1/categories/16',
    description: 'Related to all manner of shaking and displacement. Certain aftermath of earthquakes may also be found under landslides and floods.',
    layers: 'https://eonet.gsfc.nasa.gov/api/v2.1/layers/16'
  },
  'floods': {
    id: 9,
    title: 'Floods',
    link: 'https://eonet.gsfc.nasa.gov/api/v2.1/categories/9',
    description: 'Related to aspects of actual flooding--e.g., inundation, water extending beyond river and lake extents.',
    layers: 'https://eonet.gsfc.nasa.gov/api/v2.1/layers/9'
  },
  'landslides': {
    id: 14,
    title: 'Landslides',
    link: 'https://eonet.gsfc.nasa.gov/api/v2.1/categories/14',
    description: 'Related to landslides and variations thereof: mudslides, avalanche.',
    layers: 'https://eonet.gsfc.nasa.gov/api/v2.1/layers/14'
  },
  'sea-and-lake-ice': {
    id: 15,
    title: 'Sea and Lake Ice',
    link: 'https://eonet.gsfc.nasa.gov/api/v2.1/categories/15',
    description: 'Related to all ice that resides on oceans and lakes, including sea and lake ice (permanent and seasonal) and icebergs.',
    layers: 'https://eonet.gsfc.nasa.gov/api/v2.1/layers/15'
  },
  'storms': {
    id: 10,
    title: 'Severe Storms',
    link: 'https://eonet.gsfc.nasa.gov/api/v2.1/categories/10',
    description: 'Related to the atmospheric aspect of storms (hurricanes, cyclones, tornadoes, etc.). Results of storms may be included under floods, landslides, etc.',
    layers: 'https://eonet.gsfc.nasa.gov/api/v2.1/layers/10'
  },
  'temperature-extremes': {
    id: 18,
    title: 'Temperature Extremes',
    link: 'https://eonet.gsfc.nasa.gov/api/v2.1/categories/18',
    description: 'Related to anomalous land temperatures, either heat or cold.',
    layers: 'https://eonet.gsfc.nasa.gov/api/v2.1/layers/18'
  },
  'volcanoes': {
    id: 12,
    title: 'Volcanoes',
    link: 'https://eonet.gsfc.nasa.gov/api/v2.1/categories/12',
    description: 'Related to both the physical effects of an eruption (rock, ash, lava) and the atmospheric (ash and gas plumes).',
    layers: 'https://eonet.gsfc.nasa.gov/api/v2.1/layers/12'
  },
  'wildfire': {
    id: 8,
    title: 'Wildfires',
    link: 'https://eonet.gsfc.nasa.gov/api/v2.1/categories/8',
    description: 'Wildland fires includes all nature of fire, in forest and plains, as well as those that spread to become urban and industrial fire events. Fires may be naturally caused or manmade.',
    layers: 'https://eonet.gsfc.nasa.gov/api/v2.1/layers/8'
  }
};

export const GenericThreatView: React.FC<GenericThreatViewProps> = ({
  category,
}) => {
  const config = CATEGORY_CONFIG[category] || {
    label: category.toUpperCase(),
    icon: 'warning',
    count: 12,
    currentThreat: 'ELEVATED'
  };
  const records = OTHER_THREAT_RECORDS.filter((r) => r.category === category);
  const eonetMeta = EONET_CATEGORY_MAP[category];

  const [liveEonetEvents, setLiveEonetEvents] = useState<EonetEventItem[]>([]);
  const [loadingEonet, setLoadingEonet] = useState<boolean>(false);
  const [eonetStatus, setEonetStatus] = useState<string>('IDLE');

  const loadEonetData = async () => {
    if (!eonetMeta) return;
    setLoadingEonet(true);
    setEonetStatus('FETCHING_NASA_EONET');
    try {
      const res = await fetchEonetEvents(eonetMeta.id, 90, 25);
      if (res.events && res.events.length > 0) {
        setLiveEonetEvents(res.events);
        setEonetStatus(`LIVE_STREAM_SYNCED (${res.events.length} ACTIVE)`);
      } else {
        setEonetStatus('NO_RECENT_NASA_ALERTS_OPEN');
      }
    } catch (err: any) {
      console.warn('Failed to load EONET category events:', err);
      setEonetStatus('FALLBACK_MODEL_ENGAGED');
    } finally {
      setLoadingEonet(false);
    }
  };

  useEffect(() => {
    loadEonetData();
  }, [category]);

  const getThreatBadgeClass = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30] animate-pulse';
      case 'ELEVATED':
      case 'SEVERE':
        return 'bg-[#FFCC00]/20 text-[#FFCC00] border-[#FFCC00]';
      case 'MODERATE':
        return 'bg-[#00F2FF]/20 text-[#00F2FF] border-[#00F2FF]';
      default:
        return 'bg-[#2a2a2a] text-[#cfc4c5] border-[#2C2E33]';
    }
  };

  return (
    <div id={`threat-view-${category}`} className="flex flex-col w-full p-4 sm:p-6 lg:p-8 gap-8 bg-[#131313] text-[#e2e2e2] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#2C2E33] pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00F2FF] text-[20px]">
              {config.icon}
            </span>
            <span className="text-[11px] font-mono font-bold text-[#00F2FF] tracking-widest uppercase">
              PLANETARY_HAZARD_TELEMETRY // NASA EONET v2.1
            </span>
          </div>
          <h1 className="text-[36px] sm:text-[44px] font-headline font-black uppercase text-[#e2e2e2] leading-tight">
            {config.label}
          </h1>
          <p className="text-[14px] font-mono text-[#cfc4c5] max-w-xl">
            {eonetMeta?.description || 'Real-time orbital sensors, climate modeling supercomputers, and ground telemetry monitoring critical planetary thresholds.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-[#1f1f1f] border border-[#2C2E33] p-3 text-right">
            <span className="text-[10px] font-mono text-[#757575] block">
              CURRENT HAZARD LEVEL
            </span>
            <span className="font-headline font-bold text-[18px] text-[#FFCC00]">
              {config.currentThreat}
            </span>
          </div>

          <div className="bg-[#1f1f1f] border border-[#2C2E33] p-3 text-right">
            <span className="text-[10px] font-mono text-[#757575] block">
              ACTIVE SENSORS
            </span>
            <span className="font-headline font-bold text-[18px] text-[#00F2FF]">
              {config.count} NODES
            </span>
          </div>
        </div>
      </div>

      {/* NASA EONET Category Metadata Card */}
      {eonetMeta && (
        <div className="bg-[#1b1b1b] border border-[#00F2FF]/40 p-4 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00F2FF] shadow-[0_0_8px_#00F2FF] mt-1.5 animate-pulse"></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[#00F2FF] tracking-wider uppercase">
                  NASA EONET CATEGORY ID: {eonetMeta.id}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#00F2FF]/10 text-[#00F2FF] border border-[#00F2FF]/30">
                  {eonetStatus}
                </span>
              </div>
              <p className="text-[12px] font-mono text-[#cfc4c5] mt-1">
                API Link: <a href={eonetMeta.link} target="_blank" rel="noreferrer" className="text-[#00F2FF] underline hover:text-white">{eonetMeta.link}</a>
                <span className="mx-2 text-[#757575]">|</span>
                Layers: <a href={eonetMeta.layers} target="_blank" rel="noreferrer" className="text-[#cfc4c5] underline hover:text-[#00F2FF]">{eonetMeta.layers}</a>
              </p>
            </div>
          </div>

          <button
            onClick={loadEonetData}
            disabled={loadingEonet}
            className="px-3 py-1.5 bg-[#0e0e0e] hover:bg-[#2a2a2a] border border-[#00F2FF] text-[#00F2FF] text-[11px] font-mono font-bold tracking-wider uppercase transition-colors flex items-center gap-2 self-stretch md:self-auto justify-center"
          >
            <span className={`material-symbols-outlined text-[16px] ${loadingEonet ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {loadingEonet ? 'SYNCING NASA EONET...' : 'SYNC EONET TELEMETRY'}
          </button>
        </div>
      )}

      {/* Top 3 Metric Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2C2E33]">
        <div className="bg-[#1b1b1b] p-6 flex flex-col justify-between">
          <span className="text-[11px] font-mono font-bold text-[#757575] uppercase">
            ANOMALY INDEX
          </span>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-headline font-black text-[36px] text-[#FF3B30]">
              +3.84 σ
            </span>
            <span className="text-[11px] font-mono text-[#FF3B30]">+18% (30d)</span>
          </div>
          <div className="w-full h-1.5 bg-[#2a2a2a] mt-3 overflow-hidden">
            <div className="h-full bg-[#FF3B30] w-4/5"></div>
          </div>
        </div>

        <div className="bg-[#1b1b1b] p-6 flex flex-col justify-between">
          <span className="text-[11px] font-mono font-bold text-[#757575] uppercase">
            POPULATION EXPOSURE
          </span>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-headline font-black text-[36px] text-[#FFCC00]">
              184M
            </span>
            <span className="text-[11px] font-mono text-[#cfc4c5]">HIGH-RISK</span>
          </div>
          <div className="w-full h-1.5 bg-[#2a2a2a] mt-3 overflow-hidden">
            <div className="h-full bg-[#FFCC00] w-3/5"></div>
          </div>
        </div>

        <div className="bg-[#1b1b1b] p-6 flex flex-col justify-between">
          <span className="text-[11px] font-mono font-bold text-[#757575] uppercase">
            SATELLITE RESOLUTION
          </span>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="font-headline font-black text-[36px] text-[#00F2FF]">
              375m
            </span>
            <span className="text-[11px] font-mono text-[#00F2FF]">VIIRS/MODIS</span>
          </div>
          <div className="w-full h-1.5 bg-[#2a2a2a] mt-3 overflow-hidden">
            <div className="h-full bg-[#00F2FF] w-full"></div>
          </div>
        </div>
      </div>

      {/* Live NASA EONET Events Section */}
      {liveEonetEvents.length > 0 && (
        <div className="bg-[#1b1b1b] border border-[#2C2E33] flex flex-col">
          <div className="p-4 border-b border-[#2C2E33] bg-[#2a2a2a] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00F2FF] text-[20px]">
                satellite_alt
              </span>
              <span className="font-headline font-bold text-[18px] text-[#e2e2e2] uppercase tracking-wide">
                Active NASA EONET Events ({liveEonetEvents.length})
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#00F2FF]">
              GSFC.NASA.GOV TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#2C2E33] p-px">
            {liveEonetEvents.map((ev) => (
              <div key={ev.id} className="bg-[#131313] p-4 flex flex-col justify-between gap-3 hover:bg-[#1f1f1f] transition-colors border border-transparent hover:border-[#00F2FF]/40">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono text-[#00F2FF] font-bold">
                      {ev.id}
                    </span>
                    <span className="text-[10px] font-mono text-[#757575]">
                      {new Date(ev.latestDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-[15px] text-[#e2e2e2] leading-snug">
                    {ev.title}
                  </h4>
                  {ev.description && (
                    <p className="text-[11px] font-mono text-[#cfc4c5] line-clamp-2 mt-1">
                      {ev.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#2C2E33] text-[10px] font-mono">
                  <span className="text-[#cfc4c5]">
                    LAT: {ev.coordinates[0].toFixed(2)}° | LON: {ev.coordinates[1].toFixed(2)}°
                  </span>
                  <a
                    href={ev.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#00F2FF] hover:underline flex items-center gap-1"
                  >
                    EONET LINK
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional Hazard Vectors Table */}
      <div className="bg-[#1b1b1b] border border-[#2C2E33] flex flex-col">
        <div className="p-4 border-b border-[#2C2E33] bg-[#2a2a2a] flex justify-between items-center">
          <span className="font-headline font-bold text-[18px] text-[#e2e2e2] uppercase tracking-wide">
            Regional Telemetry & Sensor Stations
          </span>
          <span className="text-[11px] font-mono text-[#757575]">
            SHOWING {records.length} SECTORS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#131313] border-b border-[#2C2E33] text-[11px] font-mono text-[#757575] uppercase">
                <th className="p-4">SECTOR / REGION</th>
                <th className="p-4">ZONE CODES</th>
                <th className="p-4">SEVERITY</th>
                <th className="p-4">PRIMARY METRIC</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">30D DELTA</th>
                <th className="p-4">AI FORECAST MODEL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2E33] font-mono text-[12px]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-[#2a2a2a] transition-colors">
                  <td className="p-4 font-bold text-[#e2e2e2]">
                    {r.region}
                    <span className="block text-[10px] text-[#757575] font-normal">
                      {r.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {r.zoneCodes.map((z) => (
                        <span key={z} className="px-1.5 py-0.5 bg-[#2a2a2a] text-[10px] text-[#cfc4c5]">
                          {z}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold border ${getThreatBadgeClass(r.severity)}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[#00F2FF] font-bold block">{r.metricValue}</span>
                    <span className="text-[10px] text-[#757575]">{r.metricLabel}</span>
                  </td>
                  <td className="p-4 text-[#cfc4c5]">{r.status}</td>
                  <td className="p-4 text-[#FF3B30] font-bold">{r.delta}</td>
                  <td className="p-4 text-[#cfc4c5] text-[11px] max-w-xs">{r.forecast}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
