import React, { useState } from 'react';

interface SatelliteFeedsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SatelliteFeedsModal: React.FC<SatelliteFeedsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedBand, setSelectedBand] = useState<'THERMAL' | 'VISIBLE' | 'SAR' | 'ATMOSPHERIC'>('THERMAL');
  const [selectedConstellation, setSelectedConstellation] = useState<string>('SENTINEL-3B');

  if (!isOpen) return null;

  const feeds = [
    {
      id: 'FEED-01',
      target: 'Mauna Loa Thermal Plume (Hawaii, USA)',
      band: 'THERMAL',
      resolution: '0.4m/px GSD',
      latency: '4.2s',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpjWO5Ms2bvBZmiNY_x1cE7vLSYs8Upw-sEOLBq9yvFO0kHMSzXtF6xENjOJ2t7U42b3RD-CSIx-2NAQmX6kVSezUGPMCOkhS3eYt3i60DEUvgxoy6JzYRruBKXNarlK9f8OSb2bWnW1X6s524kcbuKSCE0Eybcx_BA-F-kaXaeimh-6Se9_v1oc9iOLbRctihLHMKCIfDii1n8BuEcu7et8ub4bzsB_-pxxb6IXW9lEm3s28tOW2Y',
    },
    {
      id: 'FEED-02',
      target: 'Boreal Taiga Megafire Front (Siberia)',
      band: 'THERMAL',
      resolution: '1.2m/px GSD',
      latency: '2.1s',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbgJ66Z1m_iJ-QkcOqVzxNeRwLBEM--WhOPDYeIU0dbWafIYhAG5pCQnlfVcnZyubb8gMQEypc7j1LHTDPIP_1ng8pV5_XvN9UclG1noqr6ifzDAwv-c9-R_OXsJjwNGlRnMziIwI-aTyo8AjCK_4HVIOoKGaXU40yOEigpyK8JdCGtVmRx-WS94zgYAZaF_vC2D_hVh2kHwUJkmY7ttm5Ogz_pzaQ1Ud-VTkVVskvnek0GDWMy0KP',
    },
    {
      id: 'FEED-03',
      target: 'Subduction Fault Zone Stress Topography',
      band: 'SAR',
      resolution: '0.1m/px InSAR',
      latency: '11.8s',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOXPsyoindGl45RLc7lEsYheETeLQJdoiVXxiYXjBfGoST6rn6TfYHemmwBf6Qj9aSiOA_ZkFBOwMFWTF8VirFH8KoxXY2Ow27-39wiHRF6UNRH-jnFV5EOnAYSn35xwcYpkK1CvM716nte2OXkcC23K9BQCTMa4E5ubAZXR2IVDJqVmTEm3TagW7gSNTK7hoTtgTlT7Kv7mwJPfpsIQhWF6koLgcxvZmE4tMB1crj3vkZ-DqP-GBp',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="bg-[#131313] border border-[#00F2FF] w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col shadow-[0_0_30px_rgba(0,242,255,0.2)]">
        {/* Modal Header */}
        <div className="p-4 bg-[#1f1f1f] border-b border-[#2C2E33] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00F2FF]">satellite_alt</span>
            <h2 className="font-headline font-bold text-[18px] uppercase tracking-wider text-[#e2e2e2]">
              ORBITAL SATELLITE TELEMETRY FEEDS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2a2a2a] text-[#cfc4c5] hover:text-[#00F2FF] border border-[#2C2E33]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col gap-6 font-mono">
          {/* Controls Bar */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-[#0e0e0e] p-3 border border-[#2C2E33]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#757575]">SPECTRAL BAND:</span>
              {(['THERMAL', 'VISIBLE', 'SAR', 'ATMOSPHERIC'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBand(b)}
                  className={`px-2.5 py-1 text-[10px] font-bold border transition-colors ${
                    selectedBand === b
                      ? 'border-[#00F2FF] bg-[#00F2FF]/10 text-[#00F2FF]'
                      : 'border-[#2C2E33] text-[#cfc4c5] hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#757575]">CONSTELLATION:</span>
              <select
                value={selectedConstellation}
                onChange={(e) => setSelectedConstellation(e.target.value)}
                className="bg-[#1b1b1b] border border-[#2C2E33] px-2 py-1 text-[11px] text-[#00F2FF] outline-none"
              >
                <option value="SENTINEL-3B">SENTINEL-3B (ESA)</option>
                <option value="LANDSAT-9">LANDSAT-9 (NASA)</option>
                <option value="GOES-18">GOES-18 (NOAA WEST)</option>
                <option value="METEOSAT-12">METEOSAT-12 (EUMETSAT)</option>
              </select>
            </div>
          </div>

          {/* Grid of feeds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className="bg-[#1b1b1b] border border-[#2C2E33] flex flex-col overflow-hidden group hover:border-[#00F2FF] transition-colors"
              >
                <div className="relative h-48 bg-black overflow-hidden">
                  <img
                    src={feed.url}
                    alt={feed.target}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute top-2 left-2 bg-[#0e0e0e]/80 border border-[#2C2E33] px-2 py-0.5 text-[9px] text-[#00F2FF]">
                    {feed.id} // {selectedConstellation}
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#0e0e0e]/80 px-1.5 py-0.5 border border-[#2C2E33]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse"></div>
                    <span className="text-[8px] text-[#39FF14]">LIVE ({feed.latency})</span>
                  </div>
                </div>

                <div className="p-3 flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-[#e2e2e2] truncate">
                    {feed.target}
                  </span>
                  <div className="flex justify-between text-[10px] text-[#757575]">
                    <span>RES: {feed.resolution}</span>
                    <span className="text-[#00F2FF]">BAND: {selectedBand}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1f1f1f] border-t border-[#2C2E33] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#00F2FF] text-black font-mono font-bold text-[11px] hover:bg-white transition-colors"
          >
            DISMISS ORBITAL FEEDS
          </button>
        </div>
      </div>
    </div>
  );
};
