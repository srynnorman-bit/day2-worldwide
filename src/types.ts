export type ThreatCategory =
  | 'asteroids-and-comets'
  | 'drought'
  | 'dust-and-haze'
  | 'earthquakes'
  | 'floods'
  | 'landslides'
  | 'sea-and-lake-ice'
  | 'storms'
  | 'temperature-extremes'
  | 'volcanoes'
  | 'wildfire';

export type GlobalNavTab = 'threat-view' | 'global-stats' | 'threat-matrix' | 'satellite-feeds' | 'kardashev-scale';

export type ThreatLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL' | 'EXTREME';

export interface AsteroidObject {
  objectId: string;
  name: string;
  approachDateUtc: string;
  velocityKmS: number;
  missDistKm: number;
  missDistAu: number;
  estDiaMinM: number;
  estDiaMaxM: number;
  threatLevel: ThreatLevel;
  orbitPeriodDays: number;
  eccentricity: number;
  inclinationDeg: number;
  hazardous: boolean;
  ra: string;
  dec: string;
  timeToApproach: string;
}

export interface MonitoringFeedItem {
  id: string;
  tag: string;
  tagType: 'warning' | 'cyan' | 'emergency' | 'system';
  timestamp: string;
  title: string;
  detail: string;
  category: ThreatCategory;
}

export interface VolcanoEvent {
  id: string;
  name: string;
  regions: string[];
  dateRange: string;
  status: 'ERUPTING' | 'RESTLESS' | 'MONITORING' | 'DORMANT (SWELLING)' | 'CALM';
  statusColor: 'emergency' | 'warning' | 'cyan' | 'slate';
  alertBars: number; // 1 to 4
  vei: number;
  coordinates: [number, number];
  so2OutputKt: number;
  ashPlumeKm: number;
  historicalComparison?: string;
}

export interface EarthquakeEvent {
  id: string;
  title: string;
  affectedZones: string[];
  dateRange: string;
  magnitude: number;
  depthKm: number;
  threatColor: 'emergency' | 'warning' | 'cyan' | 'slate';
  coordinates: [number, number];
  faultSystem: string;
  shakeIntensity: string;
}

export interface WildfireEvent {
  id: string;
  code: string;
  name: string;
  affectedZones: string[];
  dateRange: string;
  areaHa: number;
  riskIndex: number;
  status: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'CONTAINED';
  coordinates: [number, number];
  aqiContribution: number;
  link?: string;
  description?: string;
  sources?: { id: string; url: string }[];
}

export interface WildfireFeedResponse {
  success: boolean;
  source: 'NASA_EONET_LIVE' | 'TELEMETRY_CATALOG' | 'TELEMETRY_FALLBACK';
  eventsCount: number;
  days: number;
  status: string;
  wildfires: WildfireEvent[];
  message?: string;
}

export interface GeneralThreatRecord {
  id: string;
  name: string;
  category: ThreatCategory;
  region: string;
  zoneCodes: string[];
  severity: ThreatLevel;
  metricLabel: string;
  metricValue: string;
  status: string;
  delta: string;
  forecast: string;
}

export interface EonetCategory {
  id: number;
  title: string;
  link: string;
  description: string;
  layers: string;
  slug?: string;
}

export interface EonetEventItem {
  id: string;
  title: string;
  description?: string;
  link: string;
  categories: { id: number; title: string }[];
  sources: { id: string; url: string }[];
  latestDate: string;
  coordinates: [number, number];
  rawGeometries?: any[];
}

export interface AsteroidFeedResponse {
  success: boolean;
  source: 'NASA_NEOWS_LIVE' | 'TELEMETRY_FALLBACK';
  elementCount: number;
  startDate: string;
  endDate: string;
  asteroids: AsteroidObject[];
  message?: string;
  links?: any;
}

export interface WorldBankPopulationResponse {
  success: boolean;
  source: string;
  url: string;
  country: string;
  countryIso: string;
  indicator: string;
  indicatorId: string;
  year: string;
  population: number | null;
  pageInfo?: any;
  rawData?: any;
  message?: string;
}

export interface ExtinctionThreatVector {
  category: string;
  percentage: number;
  defcon: string;
  rationale: string;
}

export interface GeminiExtinctionCalculationResult {
  success: boolean;
  source: string;
  calculatedAt: string;
  extinctionProbability: number;
  defconLevel: string;
  riskTier: string;
  primaryThreatVector: string;
  detailedAssessment: string;
  threatBreakdown: ExtinctionThreatVector[];
  mitigationDirectives: string[];
}

export interface KardashevTelemetryData {
  currentRating: number; // e.g. 0.727
  currentPowerWatts: number; // e.g. 1.85e13
  currentPowerTerawatts: number; // 18.5
  currentExajoulesPerYear: number; // 585
  annualGrowthRatePercent: number; // e.g. 1.9%
  yearsToTypeI: number; // e.g. 331
  targetYearTypeI: number; // e.g. 2357
  yearsToTypeII: number; // e.g. 1540
  targetYearTypeII: number; // e.g. 3566
  planetaryPowerTargetWatts: number; // 1.0e16 (Type I)
  stellarPowerTargetWatts: number; // 1.0e26 (Type II)
  galacticPowerTargetWatts: number; // 1.0e36 (Type III)
  progressToTypeI: number; // e.g. 72.7%
  greatFilterRiskLevel: 'HIGH_CRITICAL' | 'ELEVATED' | 'MODERATE';
}


