import React from 'react';
import { AsteroidObject, EarthquakeEvent, VolcanoEvent, WildfireEvent } from '../../types';

interface DetailInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedObject: AsteroidObject | VolcanoEvent | EarthquakeEvent | WildfireEvent | null;
  objectType: 'asteroid' | 'volcano' | 'earthquake' | 'wildfire' | null;
  onDiscussInSitRep?: (draftMessage: string) => void;
}

export const DetailInspectorModal: React.FC<DetailInspectorModalProps> = ({
  isOpen,
  onClose,
  selectedObject,
  objectType,
  onDiscussInSitRep,
}) => {
  if (!isOpen || !selectedObject || !objectType) return null;

  const handleTriggerSitRepDiscussion = () => {
    let draft = '';
    if (objectType === 'asteroid') {
      const a = selectedObject as AsteroidObject;
      draft = `TELEMETRY REPORT // ${a.name} (${a.objectId}): Velocity ${a.velocityKmS} km/s, Miss Distance ${a.missDistKm.toLocaleString()} km, Threat Level: ${a.threatLevel}. Requesting orbital verification.`;
    } else if (objectType === 'volcano') {
      const v = selectedObject as VolcanoEvent;
      draft = `VOLCANIC OBSERVATION // ${v.name} (${v.regions.join(', ')}): Status ${v.status}, VEI ${v.vei}, SO2 Output ${v.so2OutputKt} kt. Ash Plume ${v.ashPlumeKm} km.`;
    } else if (objectType === 'earthquake') {
      const eq = selectedObject as EarthquakeEvent;
      draft = `SEISMIC EVENT // ${eq.title}: Magnitude ${eq.magnitude} M, Depth ${eq.depthKm} km, Fault: ${eq.faultSystem}.`;
    } else if (objectType === 'wildfire') {
      const wf = selectedObject as WildfireEvent;
      draft = `MEGAPIRE INCIDENT // ${wf.code} (${wf.name}): Burn Area ${wf.areaHa.toLocaleString()} Ha, Risk Index ${wf.riskIndex}, Status ${wf.status}.`;
    }

    if (onDiscussInSitRep) {
      onDiscussInSitRep(draft);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="bg-[#131313] border border-[#00F2FF] w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-[0_0_30px_rgba(0,242,255,0.2)]">
        {/* Header */}
        <div className="p-4 bg-[#1f1f1f] border-b border-[#2C2E33] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00F2FF]">radar</span>
            <h2 className="font-headline font-bold text-[18px] uppercase tracking-wider text-[#e2e2e2]">
              TELEMETRY INSPECTOR // {objectType.toUpperCase()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2a2a2a] text-[#cfc4c5] hover:text-[#00F2FF] border border-[#2C2E33]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Dynamic Content based on type */}
        <div className="p-6 flex flex-col gap-6 font-mono text-[#e2e2e2]">
          {objectType === 'asteroid' && (
            <>
              {(() => {
                const a = selectedObject as AsteroidObject;
                return (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start border-b border-[#2C2E33] pb-4">
                      <div>
                        <h3 className="font-headline font-bold text-[24px] text-[#e2e2e2]">
                          {a.name} ({a.objectId})
                        </h3>
                        <span className="text-[11px] text-[#cfc4c5]">
                          APPROACH DATE: {a.approachDateUtc} (UTC)
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 text-[11px] font-bold border ${
                          a.threatLevel === 'CRITICAL'
                            ? 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30]'
                            : 'bg-[#FFCC00]/20 text-[#FFCC00] border-[#FFCC00]'
                        }`}
                      >
                        {a.threatLevel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
                        <span className="text-[10px] text-[#757575] block">VELOCITY</span>
                        <span className="text-[16px] text-[#00F2FF] font-bold">
                          {a.velocityKmS.toFixed(2)} km/s
                        </span>
                      </div>
                      <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
                        <span className="text-[10px] text-[#757575] block">MISS DISTANCE</span>
                        <span className="text-[16px] text-[#FF3B30] font-bold">
                          {a.missDistKm.toLocaleString()} km
                        </span>
                      </div>
                      <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
                        <span className="text-[10px] text-[#757575] block">EST. DIAMETER</span>
                        <span className="text-[16px] text-[#e2e2e2] font-bold">
                          {a.estDiaMinM} - {a.estDiaMaxM} m
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#0e0e0e] border border-[#2C2E33] flex flex-col gap-2">
                      <span className="text-[11px] text-[#00F2FF] font-bold">
                        ORBITAL EPHEMERIS COORDINATES
                      </span>
                      <div className="grid grid-cols-2 text-[12px] text-[#cfc4c5]">
                        <span>Right Ascension (RA): {a.ra}</span>
                        <span>Declination (DEC): {a.dec}</span>
                        <span>Hazardous Classification: {a.hazardous ? 'YES (PHA)' : 'NO'}</span>
                        <span>Eccentricity (e): 0.191</span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#1b1b1b] border-l-2 border-[#FF3B30]">
                      <span className="text-[10px] text-[#757575] block">DEFENSE MITIGATION:</span>
                      <p className="text-[12px] text-[#cfc4c5] mt-1">
                        Kinetic impactor deflection probe trajectory verified. DART-II mission pre-authorization window: T-Minus 4.2 years.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {objectType === 'volcano' && (
            <>
              {(() => {
                const v = selectedObject as VolcanoEvent;
                return (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start border-b border-[#2C2E33] pb-4">
                      <div>
                        <h3 className="font-headline font-bold text-[24px] text-[#e2e2e2]">
                          {v.name}
                        </h3>
                        <span className="text-[11px] text-[#cfc4c5]">
                          REGIONS: {v.regions.join(', ')}
                        </span>
                      </div>
                      <span className="px-3 py-1 text-[11px] font-bold bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]">
                        {v.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
                        <span className="text-[10px] text-[#757575] block">EST. VEI</span>
                        <span className="text-[18px] text-[#FF3B30] font-bold">{v.vei}</span>
                      </div>
                      <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
                        <span className="text-[10px] text-[#757575] block">SO2 OUTPUT</span>
                        <span className="text-[18px] text-[#FFCC00] font-bold">{v.so2OutputKt} kt</span>
                      </div>
                      <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
                        <span className="text-[10px] text-[#757575] block">ASH PLUME</span>
                        <span className="text-[18px] text-[#00F2FF] font-bold">{v.ashPlumeKm} km</span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#1b1b1b] border-l-2 border-[#FFCC00]">
                      <span className="text-[10px] text-[#757575] block">IMPACT PROJECTION:</span>
                      <p className="text-[12px] text-[#cfc4c5] mt-1">
                        High altitude tephra ejection threat to global aviation corridors and Northern Hemisphere solar insolation models.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {objectType === 'earthquake' && (
            <>
              {(() => {
                const eq = selectedObject as EarthquakeEvent;
                return (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start border-b border-[#2C2E33] pb-4">
                      <div>
                        <h3 className="font-headline font-bold text-[24px] text-[#e2e2e2]">
                          {eq.title}
                        </h3>
                        <span className="text-[11px] text-[#cfc4c5]">
                          ZONES: {eq.affectedZones.join(', ')}
                        </span>
                      </div>
                      <span className="px-3 py-1 text-[11px] font-bold bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]">
                        ~{eq.magnitude} M
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
                        <span className="text-[10px] text-[#757575] block">FOCAL DEPTH</span>
                        <span className="text-[18px] text-[#00F2FF] font-bold">{eq.depthKm} km</span>
                      </div>
                      <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
                        <span className="text-[10px] text-[#757575] block">DATE RANGE</span>
                        <span className="text-[16px] text-[#e2e2e2] font-bold">{eq.dateRange}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {objectType === 'wildfire' && (
            <>
              {(() => {
                const wf = selectedObject as WildfireEvent;
                return (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start border-b border-[#2C2E33] pb-4">
                      <div>
                        <h3 className="font-headline font-bold text-[24px] text-[#e2e2e2]">
                          {wf.code} // {wf.name}
                        </h3>
                        <span className="text-[11px] text-[#cfc4c5]">
                          ZONES: {wf.affectedZones.join(', ')}
                        </span>
                      </div>
                      <span className="px-3 py-1 text-[11px] font-bold bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]">
                        RISK: {wf.riskIndex}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
                        <span className="text-[10px] text-[#757575] block">BURN AREA</span>
                        <span className="text-[18px] text-[#FF3B30] font-bold">
                          {wf.areaHa.toLocaleString()} Ha
                        </span>
                      </div>
                      <div className="p-3 bg-[#1b1b1b] border border-[#2C2E33]">
                        <span className="text-[10px] text-[#757575] block">AQI CONTRIBUTION</span>
                        <span className="text-[18px] text-[#FFCC00] font-bold">
                          +{wf.aqiContribution} AQI
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1f1f1f] border-t border-[#2C2E33] flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={handleTriggerSitRepDiscussion}
            className="px-4 py-2 bg-[#131313] hover:bg-[#2a2a2a] text-[#00F2FF] border border-[#00F2FF]/60 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">forum</span>
            LOG FIELD SITREP & DISCUSS
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#00F2FF] text-black font-mono font-bold text-[11px] hover:bg-white transition-colors cursor-pointer"
          >
            DISMISS INSPECTOR
          </button>
        </div>
      </div>
    </div>
  );
};
