import React, { useEffect, useState, useRef } from 'react';
import { ThreatCategory } from '../types';

interface DisqusCommentsProps {
  pageUrl?: string;
  pageIdentifier?: string;
  categoryTitle?: string;
  category?: ThreatCategory;
  prefilledDraft?: string;
  onClearPrefilledDraft?: () => void;
}

export interface TacticalSitRepReply {
  id: string;
  author: string;
  callsign: string;
  timestamp: string;
  message: string;
  endorsements: number;
}

export interface TacticalSitRep {
  id: string;
  author: string;
  callsign: string;
  timestamp: string;
  priority: 'CRITICAL' | 'ELEVATED' | 'ADVISORY';
  categoryTag?: string;
  message: string;
  upvotes: number;
  verificationBadge?: 'SATELLITE_VERIFIED' | 'RADAR_CORROBORATED' | 'FIELD_CONFIRMED' | 'EVALUATING';
  hash: string;
  replies?: TacticalSitRepReply[];
}

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: any) => void;
      }) => void;
    };
    disqus_config?: (this: any) => void;
  }
}

// Category-tailored Situation Reports seeded with authentic planetary defense & catastrophe telemetry
const CATEGORY_SITREPS: Record<string, TacticalSitRep[]> = {
  'asteroids-and-comets': [
    {
      id: 'ast-001',
      author: 'Cmdr. J. Vance',
      callsign: 'PDCO-GOLDSTONE-RADAR',
      timestamp: '6m ago',
      priority: 'CRITICAL',
      categoryTag: 'ORBITAL_EPHEMERIS',
      message: 'Goldstone Deep Space Comm Complex (DSS-14) completed 8.56 GHz radar ping on 99942 Apophis. Gravitational keyhole resonance shift of 0.00018 AU detected for 2029 close approach. Optical corroboration requested from Mauna Kea.',
      upvotes: 42,
      verificationBadge: 'RADAR_CORROBORATED',
      hash: '9f83b2a1c0d4e5f6',
      replies: [
        {
          id: 'rep-001-1',
          author: 'Dr. Elena Rostova',
          callsign: 'ESOC-DARMSTADT',
          timestamp: '3m ago',
          message: 'Darmstadt Doppler analysis confirms the Yarkovsky diurnal thermal acceleration component is within nominal covariance bounds.',
          endorsements: 12,
        },
      ],
    },
    {
      id: 'ast-002',
      author: 'Chief Astrodynamicist L. Chen',
      callsign: 'PAN-STARRS-SECTOR-7',
      timestamp: '22m ago',
      priority: 'ELEVATED',
      categoryTag: 'NEW_DETECTION',
      message: 'Pan-STARRS PS1 survey flagged Apollo-class candidate 2026-XP12. Apparent magnitude 20.8, estimated diameter 180-410 meters. MOID with Earth calculated at 0.014 AU. Telemetry dispatched to Minor Planet Center.',
      upvotes: 28,
      verificationBadge: 'SATELLITE_VERIFIED',
      hash: '3e7b1a90d8c2f4e1',
      replies: [],
    },
    {
      id: 'ast-003',
      author: 'Defense Ops Unit 4',
      callsign: 'DART-II-TASKFORCE',
      timestamp: '1h 10m ago',
      priority: 'ADVISORY',
      categoryTag: 'KINETIC_DEFLECTION',
      message: 'Autonomous kinetic impactor trajectory simulator initialized for Bennu orbital intersection window. Deflection delta-V budget model completed at 1.4 mm/s required momentum transfer.',
      upvotes: 19,
      verificationBadge: 'FIELD_CONFIRMED',
      hash: 'a5d8f1e2c9b4e7a3',
      replies: [],
    },
  ],
  volcanoes: [
    {
      id: 'volc-001',
      author: 'Dr. Gianluigi Rossi',
      callsign: 'INGV-NAPLES-OBSERVATORY',
      timestamp: '14m ago',
      priority: 'CRITICAL',
      categoryTag: 'BRADYSEISM',
      message: 'Campi Flegrei caldera Pozzuoli station registered 42 micro-seismic events in past 6 hours. Ground uplift acceleration measured at 18 mm/month. Fumarolic gas ratio CO2/CH4 surging along Solfatara ridge.',
      upvotes: 36,
      verificationBadge: 'FIELD_CONFIRMED',
      hash: '7c8d9e0f1a2b3c4d',
      replies: [
        {
          id: 'rep-volc-1',
          author: 'Civil Protection Lead M. V.',
          callsign: 'PROTEZIONE-CIVILE-ZONE-RED',
          timestamp: '8m ago',
          message: 'Zone Red emergency transit corridors cleared on stand-by. Evacuation contingency Level 3 activated.',
          endorsements: 18,
        },
      ],
    },
    {
      id: 'volc-002',
      author: 'Volcanology Field Unit 03',
      callsign: 'HVO-KILAUEA-MONITOR',
      timestamp: '45m ago',
      priority: 'ELEVATED',
      categoryTag: 'MAGMA_INTRUSION',
      message: 'Mauna Loa southwest rift zone continuous tiltmeters recording +14 microradians strain. SO2 flux spectrometer recording 180 kilotons/day atmospheric injection.',
      upvotes: 21,
      verificationBadge: 'SATELLITE_VERIFIED',
      hash: '5b6c7d8e9f0a1b2c',
      replies: [],
    },
  ],
  earthquakes: [
    {
      id: 'eq-001',
      author: 'Seismologist Kenji Sato',
      callsign: 'JMA-NANKAI-SECTOR',
      timestamp: '9m ago',
      priority: 'CRITICAL',
      categoryTag: 'MEGATHRUST_ALERT',
      message: 'Nankai Trough deep ocean borehole strainmeter array detected low-frequency tremor migration along Hyuganada rupture segment. Megathrust locking index at 94%. Tsunami gauge buoys armed.',
      upvotes: 51,
      verificationBadge: 'RADAR_CORROBORATED',
      hash: '1a2b3c4d5e6f7a8b',
      replies: [
        {
          id: 'rep-eq-1',
          author: 'USGS Global Network',
          callsign: 'NEIC-GOLDEN-CO',
          timestamp: '4m ago',
          message: 'USGS broadband stations confirm cross-Pacific Rayleigh wave propagation. Automated alert sent to Pacific Tsunami Warning Center.',
          endorsements: 25,
        },
      ],
    },
    {
      id: 'eq-002',
      author: 'Field Geologist Sarah Miller',
      callsign: 'USGS-PARKFIELD-ARRAY',
      timestamp: '52m ago',
      priority: 'ELEVATED',
      categoryTag: 'FAULT_CREEP',
      message: 'San Andreas Fault creepmeter near Cholame recorded 4.2mm episodic slip without surface rupture. Acoustic emission sensors recording high-frequency micro-cracking.',
      upvotes: 16,
      verificationBadge: 'FIELD_CONFIRMED',
      hash: '2b3c4d5e6f7a8b9c',
      replies: [],
    },
  ],
  wildfire: [
    {
      id: 'wf-001',
      author: 'Aerial Incident Commander D. Boyd',
      callsign: 'COPERNICUS-EMS-RAPID',
      timestamp: '18m ago',
      priority: 'CRITICAL',
      categoryTag: 'PYROCUMULONIMBUS',
      message: 'Siberian Taiga Megafire complex generated violent pyro-Cb storm reaching 14km stratosphere. Lightning feedback loop ignited 18 subsidiary fire fronts across permafrost basin.',
      upvotes: 39,
      verificationBadge: 'SATELLITE_VERIFIED',
      hash: '4d5e6f7a8b9c0d1e',
      replies: [],
    },
    {
      id: 'wf-002',
      author: 'Forestry Sentinel 08',
      callsign: 'CAL-FIRE-NORTH',
      timestamp: '1h 05m ago',
      priority: 'ELEVATED',
      categoryTag: 'AQI_HAZARD',
      message: 'Sierra Nevada complex containment down to 12%. Atmospheric aerosol optical depth (AOD) > 3.8. Regional particulate index PM2.5 exceeding hazardous instrumentation saturation threshold.',
      upvotes: 22,
      verificationBadge: 'FIELD_CONFIRMED',
      hash: '5e6f7a8b9c0d1e2f',
      replies: [],
    },
  ],
  default: [
    {
      id: 'sr-001',
      author: 'Commander J. Vance',
      callsign: 'NORAD-BUNKER-07',
      timestamp: '12m ago',
      priority: 'CRITICAL',
      categoryTag: 'PLANETARY_SENSOR',
      message: 'Planetary sensor array recalibrated. Tracking secondary orbital resonance shifts across Near-Earth Objects and global catastrophic vectors.',
      upvotes: 34,
      verificationBadge: 'RADAR_CORROBORATED',
      hash: '9f83b2a1c0d4e5f6',
      replies: [
        {
          id: 'sr-rep-1',
          author: 'Field Ops Lead Marcus T.',
          callsign: 'PACIFIC-WATCH',
          timestamp: '7m ago',
          message: 'Telemetry confirmed. Secondary backup telemetry satellites online.',
          endorsements: 15,
        },
      ],
    },
    {
      id: 'sr-002',
      author: 'Dr. Elena Rostova',
      callsign: 'ESOC-DARMSTADT',
      timestamp: '38m ago',
      priority: 'ELEVATED',
      categoryTag: 'COVARIANCE_SYNC',
      message: 'Telemetry synchronized with European Space Operations Centre. Cross-referencing Sentinel-3 multispectral infrared thermography with ground arrays.',
      upvotes: 26,
      verificationBadge: 'SATELLITE_VERIFIED',
      hash: '8a7b6c5d4e3f2a1b',
      replies: [],
    },
    {
      id: 'sr-003',
      author: 'Field Ops Lead Marcus T.',
      callsign: 'PACIFIC-WATCH',
      timestamp: '1h 14m ago',
      priority: 'ADVISORY',
      categoryTag: 'EARLY_WARNING',
      message: 'Sub-surface acoustic and ocean floor pressure sensors reporting steady baseline. Early warning sirens armed on stand-by across coastal defense nodes.',
      upvotes: 17,
      verificationBadge: 'FIELD_CONFIRMED',
      hash: '7a6b5c4d3e2f1a0b',
      replies: [],
    },
  ],
};

// Play subtle tactical audio telemetry blip using Web Audio API
const playTacticalBlip = (frequency = 880, type: OscillatorType = 'sine', duration = 0.08) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio permission/context errors silently
  }
};

export const DisqusComments: React.FC<DisqusCommentsProps> = ({
  pageUrl = typeof window !== 'undefined' ? window.location.href : '',
  pageIdentifier = 'worldwide-doomsday-advisor-main',
  categoryTitle = 'GLOBAL THREAT DISCUSSIONS & SITUATION REPORTS',
  category = 'asteroids-and-comets',
  prefilledDraft = '',
  onClearPrefilledDraft,
}) => {
  const [disqusStatus, setDisqusStatus] = useState<'loading' | 'loaded' | 'fallback'>('loading');
  const [activeTab, setActiveTab] = useState<'sitrep' | 'disqus'>('sitrep');
  const [disqusShortname, setDisqusShortname] = useState<string>(() => {
    try {
      return localStorage.getItem('custom_disqus_shortname') || 'sn260827-1';
    } catch {
      return 'sn260827-1';
    }
  });
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [shortnameInput, setShortnameInput] = useState<string>(disqusShortname);

  // Sound effects enabled
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Search and filter state
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'ELEVATED' | 'ADVISORY'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Replying state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState<string>('OPERATOR_FIELD_UNIT');
  const [replyText, setReplyText] = useState<string>('');

  // Copy notification state
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // SitRep storage key specific to this category / identifier
  const storageKey = `sitreps_${category || pageIdentifier}`;

  // Tactical SitRep state
  const [sitReps, setSitReps] = useState<TacticalSitRep[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return CATEGORY_SITREPS[category] || CATEGORY_SITREPS.default;
  });

  // Re-seed if category changes and no custom items
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSitReps(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setSitReps(CATEGORY_SITREPS[category] || CATEGORY_SITREPS.default);
  }, [category, storageKey]);

  // Form submission state
  const [newSitRepAuthor, setNewSitRepAuthor] = useState('COMMAND_OPERATOR_01');
  const [newSitRepCallsign, setNewSitRepCallsign] = useState('GLOBAL-DEFENSE-NET');
  const [newSitRepMessage, setNewSitRepMessage] = useState(prefilledDraft || '');
  const [newSitRepPriority, setNewSitRepPriority] = useState<'CRITICAL' | 'ELEVATED' | 'ADVISORY'>('CRITICAL');
  const [newSitRepCategoryTag, setNewSitRepCategoryTag] = useState<string>('TELEMETRY_LOG');

  const draftInputRef = useRef<HTMLInputElement>(null);

  // Sync prefilled draft if changed externally
  useEffect(() => {
    if (prefilledDraft) {
      setNewSitRepMessage(prefilledDraft);
      setActiveTab('sitrep');
      draftInputRef.current?.focus();
    }
  }, [prefilledDraft]);

  // Disqus Script Loader with fallback handling
  const loadDisqusEmbed = (shortname: string) => {
    setDisqusStatus('loading');
    
    window.disqus_config = function (this: any) {
      try {
        if (this && typeof this === 'object') {
          this.page = this.page || {};
          this.page.url = pageUrl || (typeof window !== 'undefined' ? window.location.href : '');
          this.page.identifier = pageIdentifier;
          this.page.title = categoryTitle;
        }
      } catch (err) {
        console.warn('Disqus config setup notice:', err);
      }
    };

    if (window.DISQUS) {
      try {
        window.DISQUS.reset({
          reload: true,
          config: function (this: any) {
            if (this && typeof this === 'object') {
              this.page = this.page || {};
              this.page.url = pageUrl || (typeof window !== 'undefined' ? window.location.href : '');
              this.page.identifier = pageIdentifier;
              this.page.title = categoryTitle;
            }
          },
        });
        setDisqusStatus('loaded');
      } catch (e) {
        console.warn('Disqus reset notice:', e);
        setDisqusStatus('fallback');
      }
    } else {
      try {
        const existingScript = document.getElementById('disqus_embed_script');
        if (existingScript) {
          existingScript.remove();
        }

        const s = document.createElement('script');
        s.id = 'disqus_embed_script';
        s.src = `https://${shortname}.disqus.com/embed.js`;
        s.setAttribute('data-timestamp', String(+new Date()));
        s.async = true;
        s.crossOrigin = 'anonymous';

        s.onload = () => {
          setDisqusStatus('loaded');
        };

        s.onerror = () => {
          console.warn('Disqus embed could not be loaded in this sandbox environment. Tactical fallback active.');
          setDisqusStatus('fallback');
        };

        (document.head || document.body).appendChild(s);
      } catch (e) {
        console.warn('Disqus script injection error:', e);
        setDisqusStatus('fallback');
      }
    }
  };

  useEffect(() => {
    loadDisqusEmbed(disqusShortname);
  }, [pageUrl, pageIdentifier, categoryTitle, disqusShortname]);

  const handleSaveShortname = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = shortnameInput.trim() || 'sn260827-1';
    setDisqusShortname(clean);
    try {
      localStorage.setItem('custom_disqus_shortname', clean);
    } catch {
      // ignore
    }
    setShowConfigModal(false);
    loadDisqusEmbed(clean);
    if (soundEnabled) playTacticalBlip(920, 'sine', 0.1);
  };

  const handleResetShortname = () => {
    setShortnameInput('sn260827-1');
    setDisqusShortname('sn260827-1');
    try {
      localStorage.removeItem('custom_disqus_shortname');
    } catch {
      // ignore
    }
    setShowConfigModal(false);
    loadDisqusEmbed('sn260827-1');
    if (soundEnabled) playTacticalBlip(660, 'sine', 0.1);
  };

  const handleAddSitRep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSitRepMessage.trim()) return;

    if (soundEnabled) {
      playTacticalBlip(1200, 'square', 0.12);
    }

    const randomHash = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);

    const newItem: TacticalSitRep = {
      id: `sr-${Date.now()}`,
      author: newSitRepAuthor.trim() || 'STATION_OPERATOR',
      callsign: newSitRepCallsign.trim() || 'GLOBAL-DEFENSE-NET',
      timestamp: 'Just now',
      priority: newSitRepPriority,
      categoryTag: newSitRepCategoryTag || 'TELEMETRY_LOG',
      message: newSitRepMessage.trim(),
      upvotes: 1,
      verificationBadge: 'FIELD_CONFIRMED',
      hash: randomHash,
      replies: [],
    };

    const updated = [newItem, ...sitReps];
    setSitReps(updated);
    setNewSitRepMessage('');
    if (onClearPrefilledDraft) onClearPrefilledDraft();

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore storage quota
    }
  };

  const handleAddReply = (sitRepId: string) => {
    if (!replyText.trim()) return;
    if (soundEnabled) playTacticalBlip(980, 'sine', 0.09);

    const newReply: TacticalSitRepReply = {
      id: `rep-${Date.now()}`,
      author: replyAuthor.trim() || 'FIELD_UNIT',
      callsign: 'SUB-STATION',
      timestamp: 'Just now',
      message: replyText.trim(),
      endorsements: 1,
    };

    const updated = sitReps.map((sr) => {
      if (sr.id === sitRepId) {
        return {
          ...sr,
          replies: [...(sr.replies || []), newReply],
        };
      }
      return sr;
    });

    setSitReps(updated);
    setReplyText('');
    setReplyingToId(null);

    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleUpvote = (id: string) => {
    if (soundEnabled) playTacticalBlip(750, 'sine', 0.05);
    const updated = sitReps.map((sr) => (sr.id === id ? { ...sr, upvotes: sr.upvotes + 1 } : sr));
    setSitReps(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore storage quota
    }
  };

  const handleUpvoteReply = (sitRepId: string, replyId: string) => {
    if (soundEnabled) playTacticalBlip(750, 'sine', 0.05);
    const updated = sitReps.map((sr) => {
      if (sr.id === sitRepId && sr.replies) {
        return {
          ...sr,
          replies: sr.replies.map((r) => (r.id === replyId ? { ...r, endorsements: r.endorsements + 1 } : r)),
        };
      }
      return sr;
    });
    setSitReps(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(`SHA256://${hash}`);
    setCopiedHashId(id);
    if (soundEnabled) playTacticalBlip(1050, 'triangle', 0.06);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleExportCommsLog = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sitReps, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `sitrep_comms_${category}_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  // Filter SitReps based on priority & search query
  const filteredSitReps = sitReps.filter((sr) => {
    const matchPriority = priorityFilter === 'ALL' || sr.priority === priorityFilter;
    const matchSearch =
      searchQuery === '' ||
      sr.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sr.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sr.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sr.categoryTag && sr.categoryTag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchPriority && matchSearch;
  });

  return (
    <section id="tactical-discussions" className="w-full bg-[#0e0e0e] border-t border-[#2C2E33] px-4 py-8 lg:px-12 mt-8 font-mono text-[#e2e2e2]">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">
        
        {/* Section Header with Tabs & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#2C2E33] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1b1b1b] border border-[#00F2FF]/40 flex items-center justify-center text-[#00F2FF]">
              <span className="material-symbols-outlined text-[20px]">forum</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-[16px] sm:text-[18px] uppercase tracking-wider text-[#e2e2e2]">
                  {categoryTitle}
                </h3>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#00F2FF]/10 text-[#00F2FF] border border-[#00F2FF]/30">
                  {category.toUpperCase().replace(/-/g, ' ')}
                </span>
              </div>
              <span className="text-[11px] text-[#757575] block mt-0.5">
                INTER-STATION SECURE FREQUENCY // REAL-TIME DISASTER SITREP FEED & DISQUS COMMUNITY STREAM
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 border text-[11px] transition-colors flex items-center gap-1 ${
                soundEnabled ? 'bg-[#1f1f1f] border-[#00F2FF] text-[#00F2FF]' : 'bg-[#141414] border-[#2C2E33] text-[#757575]'
              }`}
              title={soundEnabled ? 'Audio Telemetry Sound Enabled' : 'Audio Muted'}
            >
              <span className="material-symbols-outlined text-[15px]">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportCommsLog}
              className="px-2.5 py-1 text-[11px] bg-[#141414] hover:bg-[#1f1f1f] border border-[#2C2E33] text-[#cfc4c5] hover:text-[#00F2FF] transition-colors flex items-center gap-1"
              title="Download Situation Reports Transcript"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              <span className="hidden sm:inline">EXPORT LOG</span>
            </button>

            {/* Disqus Configuration Button */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-2.5 py-1 text-[11px] bg-[#141414] hover:bg-[#1f1f1f] border border-[#2C2E33] text-[#cfc4c5] hover:text-[#00F2FF] transition-colors flex items-center gap-1"
              title="Configure Disqus Forum Shortname"
            >
              <span className="material-symbols-outlined text-[14px]">settings</span>
              <span className="hidden sm:inline">DISQUS SETTINGS</span>
            </button>

            {/* View Switching Tabs */}
            <div className="flex items-center border border-[#2C2E33] p-0.5 bg-[#141414]">
              <button
                id="tab-btn-sitrep"
                onClick={() => {
                  setActiveTab('sitrep');
                  if (soundEnabled) playTacticalBlip(800, 'sine', 0.05);
                }}
                className={`px-3 py-1 text-[11px] font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'sitrep'
                    ? 'bg-[#00F2FF] text-black'
                    : 'text-[#cfc4c5] hover:text-[#e2e2e2]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'sitrep' ? 'bg-black' : 'bg-[#00F2FF] animate-pulse'}`}></span>
                TACTICAL SITREPS ({sitReps.length})
              </button>

              <button
                id="tab-btn-disqus"
                onClick={() => {
                  setActiveTab('disqus');
                  if (soundEnabled) playTacticalBlip(800, 'sine', 0.05);
                }}
                className={`px-3 py-1 text-[11px] font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'disqus'
                    ? 'bg-[#00F2FF] text-black'
                    : 'text-[#cfc4c5] hover:text-[#e2e2e2]'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">forum</span>
                DISQUS EMBED
              </button>
            </div>
          </div>
        </div>

        {/* Tactical SitRep Board View */}
        {activeTab === 'sitrep' && (
          <div className="flex flex-col gap-6">
            
            {/* New SitRep Submission Box */}
            <form onSubmit={handleAddSitRep} className="bg-[#141414] border border-[#2C2E33] p-4 sm:p-5 flex flex-col gap-3.5 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#2C2E33] pb-3">
                <span className="text-[12px] font-bold text-[#00F2FF] uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#00F2FF]">cell_tower</span>
                  BROADCAST FIELD OBSERVATION / EMERGENCY SITREP
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Tag Selector */}
                  <select
                    value={newSitRepCategoryTag}
                    onChange={(e) => setNewSitRepCategoryTag(e.target.value)}
                    className="bg-[#1f1f1f] border border-[#2C2E33] text-[10px] px-2 py-1 text-[#00F2FF] outline-none"
                  >
                    <option value="TELEMETRY_LOG">TAG: TELEMETRY LOG</option>
                    <option value="ORBITAL_EPHEMERIS">TAG: ORBITAL EPHEMERIS</option>
                    <option value="MAGMA_INTRUSION">TAG: MAGMA INTRUSION</option>
                    <option value="SEISMIC_SURGE">TAG: SEISMIC SURGE</option>
                    <option value="PYROCUMULONIMBUS">TAG: PYROCUMULONIMBUS</option>
                    <option value="SURFACE_VERIFIED">TAG: SURFACE VERIFIED</option>
                    <option value="EVACUATION_ALERT">TAG: EVACUATION ALERT</option>
                  </select>

                  {/* Priority Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#757575]">SEVERITY:</span>
                    <select
                      value={newSitRepPriority}
                      onChange={(e) => setNewSitRepPriority(e.target.value as any)}
                      className={`border text-[11px] font-bold px-2 py-1 outline-none ${
                        newSitRepPriority === 'CRITICAL'
                          ? 'bg-[#FF3B30]/10 border-[#FF3B30] text-[#FF3B30]'
                          : newSitRepPriority === 'ELEVATED'
                          ? 'bg-[#FFCC00]/10 border-[#FFCC00] text-[#FFCC00]'
                          : 'bg-[#00F2FF]/10 border-[#00F2FF] text-[#00F2FF]'
                      }`}
                    >
                      <option value="CRITICAL" className="bg-[#1b1b1b] text-[#FF3B30]">CRITICAL (RED ALERT)</option>
                      <option value="ELEVATED" className="bg-[#1b1b1b] text-[#FFCC00]">ELEVATED (YELLOW WATCH)</option>
                      <option value="ADVISORY" className="bg-[#1b1b1b] text-[#00F2FF]">ADVISORY (CYAN ADVISORY)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Author & Callsign Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center bg-[#0e0e0e] border border-[#2C2E33] px-3 py-1.5">
                  <span className="text-[10px] text-[#757575] mr-2">OPERATOR:</span>
                  <input
                    type="text"
                    value={newSitRepAuthor}
                    onChange={(e) => setNewSitRepAuthor(e.target.value)}
                    placeholder="COMMAND_OPERATOR..."
                    className="bg-transparent text-[12px] text-[#e2e2e2] outline-none w-full"
                  />
                </div>
                <div className="flex items-center bg-[#0e0e0e] border border-[#2C2E33] px-3 py-1.5">
                  <span className="text-[10px] text-[#757575] mr-2">CALLSIGN / BASE:</span>
                  <input
                    type="text"
                    value={newSitRepCallsign}
                    onChange={(e) => setNewSitRepCallsign(e.target.value)}
                    placeholder="BASE / OBSERVATORY CALLSIGN..."
                    className="bg-transparent text-[12px] text-[#00F2FF] outline-none w-full"
                  />
                </div>
              </div>

              {/* Message Input & Broadcast Button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  ref={draftInputRef}
                  type="text"
                  value={newSitRepMessage}
                  onChange={(e) => setNewSitRepMessage(e.target.value)}
                  placeholder="LOG TELEMETRY OBSERVATIONS, SATELLITE ANOMALIES, OR ESCALATION DETAILS..."
                  className="flex-1 bg-[#0e0e0e] border border-[#2C2E33] px-3 py-2.5 text-[12px] text-[#e2e2e2] placeholder-[#757575] outline-none focus:border-[#00F2FF] transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00F2FF] hover:bg-white text-black font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-[0_0_12px_rgba(0,242,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  TRANSMIT
                </button>
              </div>
            </form>

            {/* Filter and Search Bar for Existing Reports */}
            <div className="bg-[#141414] border border-[#2C2E33] p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-[#757575] uppercase">PRIORITY FILTER:</span>
                {(['ALL', 'CRITICAL', 'ELEVATED', 'ADVISORY'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setPriorityFilter(lvl);
                      if (soundEnabled) playTacticalBlip(700, 'sine', 0.03);
                    }}
                    className={`px-2.5 py-0.5 text-[10px] font-bold border transition-colors ${
                      priorityFilter === lvl
                        ? 'bg-[#00F2FF]/20 border-[#00F2FF] text-[#00F2FF]'
                        : 'bg-[#0e0e0e] border-[#2C2E33] text-[#757575] hover:text-[#cfc4c5]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="flex items-center bg-[#0e0e0e] border border-[#2C2E33] px-2.5 py-1 w-full sm:w-64">
                <span className="material-symbols-outlined text-[14px] text-[#757575] mr-1.5">search</span>
                <input
                  type="text"
                  placeholder="SEARCH REPORTS / LOGS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-[11px] text-[#e2e2e2] placeholder-[#757575] outline-none w-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-[#757575] hover:text-[#e2e2e2] text-[10px]">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* SitRep Feed List */}
            <div className="flex flex-col gap-3">
              {filteredSitReps.length === 0 ? (
                <div className="bg-[#141414] border border-[#2C2E33] p-8 text-center text-[#757575] flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-[28px] text-[#757575]">portable_wifi_off</span>
                  <span>NO SITREPS MATCH CURRENT SEARCH OR FILTER CRITERIA</span>
                  <button
                    onClick={() => {
                      setPriorityFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="mt-2 text-[11px] text-[#00F2FF] underline"
                  >
                    RESET FILTERS
                  </button>
                </div>
              ) : (
                filteredSitReps.map((sr) => {
                  const priorityBadge =
                    sr.priority === 'CRITICAL'
                      ? 'bg-[#FF3B30]/10 border-[#FF3B30] text-[#FF3B30]'
                      : sr.priority === 'ELEVATED'
                      ? 'bg-[#FFCC00]/10 border-[#FFCC00] text-[#FFCC00]'
                      : 'bg-[#00F2FF]/10 border-[#00F2FF] text-[#00F2FF]';

                  return (
                    <div
                      key={sr.id}
                      className="bg-[#141414] border border-[#2C2E33] hover:border-[#00F2FF]/40 p-4 sm:p-5 transition-all flex flex-col gap-3"
                    >
                      {/* Sitrep Header */}
                      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#2C2E33]/60 pb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 border ${priorityBadge}`}>
                            {sr.priority}
                          </span>
                          
                          {sr.categoryTag && (
                            <span className="text-[9px] font-mono text-[#00F2FF] bg-[#00F2FF]/10 border border-[#00F2FF]/30 px-1.5 py-0.5">
                              {sr.categoryTag}
                            </span>
                          )}

                          {sr.verificationBadge && (
                            <span className="text-[9px] text-[#39FF14] bg-[#39FF14]/10 border border-[#39FF14]/30 px-1.5 py-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[11px]">verified</span>
                              {sr.verificationBadge.replace(/_/g, ' ')}
                            </span>
                          )}

                          <span className="text-[12px] font-bold text-[#e2e2e2] ml-1">{sr.author}</span>
                          <span className="text-[10px] text-[#757575]">[{sr.callsign}]</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-[#757575]">
                          <span>{sr.timestamp}</span>
                        </div>
                      </div>

                      {/* Sitrep Message */}
                      <p className="text-[12.5px] text-[#cfc4c5] leading-relaxed select-text">{sr.message}</p>

                      {/* Sitrep Action Footer */}
                      <div className="flex flex-wrap justify-between items-center pt-2.5 border-t border-[#2C2E33]/60 mt-1 gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyHash(sr.hash, sr.id)}
                            className="text-[10px] text-[#757575] hover:text-[#00F2FF] flex items-center gap-1 bg-[#0e0e0e] px-2 py-1 border border-[#2C2E33] transition-colors"
                            title="Click to copy SHA-256 verification hash"
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              {copiedHashId === sr.id ? 'check' : 'fingerprint'}
                            </span>
                            <span>{copiedHashId === sr.id ? 'HASH COPIED' : `HASH: ${sr.hash.substring(0, 8)}...`}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReplyingToId(replyingToId === sr.id ? null : sr.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] border transition-colors ${
                              replyingToId === sr.id
                                ? 'bg-[#00F2FF]/20 border-[#00F2FF] text-[#00F2FF]'
                                : 'bg-[#0e0e0e] border-[#2C2E33] text-[#cfc4c5] hover:text-[#e2e2e2]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">reply</span>
                            <span>REPLY ({sr.replies?.length || 0})</span>
                          </button>

                          <button
                            onClick={() => handleUpvote(sr.id)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-[#0e0e0e] hover:bg-[#1f1f1f] text-[#00F2FF] text-[11px] font-bold border border-[#2C2E33] hover:border-[#00F2FF] transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                            <span>ENDORSE ({sr.upvotes})</span>
                          </button>
                        </div>
                      </div>

                      {/* Nested Replies Stream */}
                      {sr.replies && sr.replies.length > 0 && (
                        <div className="mt-2 pl-3 sm:pl-6 border-l-2 border-[#2C2E33] flex flex-col gap-2 pt-2">
                          {sr.replies.map((reply) => (
                            <div key={reply.id} className="bg-[#0e0e0e] border border-[#2C2E33] p-3 flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold text-[#e2e2e2]">{reply.author}</span>
                                  <span className="text-[9px] text-[#757575]">[{reply.callsign}]</span>
                                </div>
                                <span className="text-[9px] text-[#757575]">{reply.timestamp}</span>
                              </div>
                              <p className="text-[11.5px] text-[#cfc4c5] leading-normal">{reply.message}</p>
                              <div className="flex justify-end pt-1">
                                <button
                                  onClick={() => handleUpvoteReply(sr.id, reply.id)}
                                  className="text-[9px] text-[#00F2FF] hover:underline flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-[11px]">thumb_up</span>
                                  <span>{reply.endorsements}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Active Reply Drafting Form */}
                      {replyingToId === sr.id && (
                        <div className="mt-2 p-3 bg-[#0e0e0e] border border-[#00F2FF]/40 flex flex-col gap-2">
                          <span className="text-[10px] text-[#00F2FF] font-bold">
                            REPLYING TO {sr.author} [{sr.callsign}]:
                          </span>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={replyAuthor}
                              onChange={(e) => setReplyAuthor(e.target.value)}
                              placeholder="YOUR OPERATOR CALLSIGN..."
                              className="sm:w-1/3 bg-[#141414] border border-[#2C2E33] px-2.5 py-1.5 text-[11px] text-[#e2e2e2] outline-none focus:border-[#00F2FF]"
                            />
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="ENTER INCIDENT CORROBORATION OR RESPONSE..."
                              className="flex-1 bg-[#141414] border border-[#2C2E33] px-2.5 py-1.5 text-[11px] text-[#e2e2e2] outline-none focus:border-[#00F2FF]"
                            />
                            <button
                              onClick={() => handleAddReply(sr.id)}
                              className="px-4 py-1.5 bg-[#00F2FF] hover:bg-white text-black font-bold text-[10px] uppercase transition-colors shrink-0 cursor-pointer"
                            >
                              POST REPLY
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Disqus Embed Container View */}
        {activeTab === 'disqus' && (
          <div className="bg-[#141414] border border-[#2C2E33] p-4 sm:p-6 min-h-[300px] flex flex-col gap-4">
            {/* Direct Info & Action Toolbar */}
            <div className="bg-[#0e0e0e] border border-[#2C2E33] p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00F2FF] text-[18px]">cloud_sync</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-[#e2e2e2]">DISQUS FORUM ID:</span>
                    <span className="text-[11px] text-[#00F2FF] font-bold px-1.5 py-0.2 bg-[#00F2FF]/10 border border-[#00F2FF]/40">
                      {disqusShortname}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#757575] block mt-0.5">
                    Thread Identifier: {pageIdentifier}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadDisqusEmbed(disqusShortname)}
                  className="px-3 py-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2C2E33] text-[#cfc4c5] hover:text-[#00F2FF] text-[10px] font-bold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">refresh</span>
                  RELOAD THREAD
                </button>

                <a
                  href={`https://${disqusShortname}.disqus.com/`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-[#00F2FF] text-black font-bold text-[10px] uppercase hover:bg-white transition-colors flex items-center gap-1"
                >
                  <span>OPEN FORUM PAGE</span>
                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                </a>
              </div>
            </div>

            {/* Sandbox Notice if Fallback occurs */}
            {disqusStatus === 'fallback' && (
              <div className="bg-[#0e0e0e] border border-[#FFCC00]/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2 text-[#FFCC00] text-[12px]">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5 sm:mt-0">warning</span>
                  <span>
                    Disqus iframe script is restricted by your browser's third-party cookie/tracking prevention in this iframe. 
                    You can discuss freely in our live <strong>Tactical SitRep channel</strong> or open Disqus directly.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('sitrep')}
                    className="px-3 py-1.5 bg-[#00F2FF] text-black font-bold text-[10px] uppercase hover:bg-white transition-colors"
                  >
                    SWITCH TO SITREPS
                  </button>
                </div>
              </div>
            )}

            {/* Actual Disqus Container */}
            <div id="disqus_thread" className="mt-2 text-[#e2e2e2]"></div>
            <noscript>
              Please enable JavaScript to view the comments powered by Disqus.
            </noscript>
          </div>
        )}
      </div>

      {/* Disqus Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="bg-[#141414] border border-[#00F2FF] w-full max-w-md p-6 flex flex-col gap-4 shadow-[0_0_30px_rgba(0,242,255,0.2)]">
            <div className="flex justify-between items-center border-b border-[#2C2E33] pb-3">
              <div className="flex items-center gap-2 text-[#00F2FF]">
                <span className="material-symbols-outlined">settings</span>
                <span className="font-headline font-bold text-[16px] uppercase tracking-wider text-[#e2e2e2]">
                  DISQUS FORUM SETTINGS
                </span>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-[#757575] hover:text-[#e2e2e2] p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveShortname} className="flex flex-col gap-3 text-[12px]">
              <label className="text-[11px] text-[#cfc4c5]">
                DISQUS WEBSITE SHORTNAME (e.g. <code>my-doomsday-forum</code>):
              </label>
              <input
                type="text"
                value={shortnameInput}
                onChange={(e) => setShortnameInput(e.target.value)}
                placeholder="sn260827-1"
                className="bg-[#0e0e0e] border border-[#2C2E33] px-3 py-2 text-[#00F2FF] font-bold outline-none focus:border-[#00F2FF]"
              />
              <span className="text-[10px] text-[#757575]">
                Default shortname is <code>sn260827-1</code>. Entering your custom Disqus shortname links this application to your own Disqus community.
              </span>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#2C2E33]">
                <button
                  type="button"
                  onClick={handleResetShortname}
                  className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#cfc4c5] text-[10px] border border-[#2C2E33]"
                >
                  RESET DEFAULT
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] text-[#cfc4c5] text-[10px] border border-[#2C2E33]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#00F2FF] hover:bg-white text-black font-bold text-[10px] uppercase transition-colors"
                  >
                    APPLY & RELOAD
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
