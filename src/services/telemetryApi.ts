import {
  AsteroidFeedResponse,
  EonetCategory,
  EonetEventItem,
  GeminiExtinctionCalculationResult,
  WildfireFeedResponse,
  WorldBankPopulationResponse,
} from '../types';

export interface TelemetryStatus {
  nasaNeoWs: {
    endpoint: string;
    apiKeyStatus: string;
    status: string;
  };
  nasaEonet: {
    endpoint: string;
    version: string;
    status: string;
    categoriesCount: number;
  };
}

/**
 * Fetch live Asteroid close approach feed from NASA NeoWs via backend proxy
 */
export async function fetchLiveAsteroids(startDate?: string, endDate?: string): Promise<AsteroidFeedResponse> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const url = `/api/asteroids${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch asteroid data: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch population indicator for a country and year from World Bank API
 * (e.g. SGP / 2025: https://api.worldbank.org/v2/country/SGP/indicator/SP.POP.TOTL?format=json&date=2025)
 */
export async function fetchWorldBankPopulation(
  country: string = 'SGP',
  date: string = '2025'
): Promise<WorldBankPopulationResponse> {
  const params = new URLSearchParams({ country, date });
  const response = await fetch(`/api/worldbank/population?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch World Bank population: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Calculate multi-hazard planetary extinction probability using Gemini AI
 */
export async function calculateAIExtinctionProbability(params?: {
  neoObjectsCount?: number;
  hazardousNeosCount?: number;
  volcanoActivityLevel?: string;
  earthquakeActivityLevel?: string;
  wildfireIntensity?: string;
  atmosphericCO2?: string;
  worldPopulation?: string;
  activeThreats?: string[];
  customParameters?: string;
}): Promise<GeminiExtinctionCalculationResult> {
  const response = await fetch('/api/ai/calculate-extinction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params || {}),
  });

  if (!response.ok) {
    throw new Error(`Failed to calculate extinction probability: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchEonetCategories(): Promise<{
  title: string;
  description: string;
  link: string;
  categories: EonetCategory[];
}> {
  const response = await fetch('/api/eonet/categories');
  if (!response.ok) {
    throw new Error(`Failed to fetch EONET categories: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch live natural events from NASA EONET v2.1 via backend proxy
 */
export async function fetchEonetEvents(
  category?: string | number,
  days: number = 60,
  limit: number = 50
): Promise<{
  success: boolean;
  source: string;
  eventsCount: number;
  events: EonetEventItem[];
}> {
  const params = new URLSearchParams();
  if (category !== undefined && category !== null && category !== '') {
    params.append('category', String(category));
  }
  params.append('days', String(days));
  params.append('limit', String(limit));

  const response = await fetch(`/api/eonet/events?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch EONET events: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch live Wildfires from NASA EONET v2.1 via backend proxy
 */
export async function fetchLiveWildfires(
  days: number = 60,
  status: string = 'open',
  limit: number = 100,
  fallback: boolean = false
): Promise<WildfireFeedResponse> {
  const params = new URLSearchParams({
    days: String(days),
    status,
    limit: String(limit),
  });
  if (fallback) {
    params.append('fallback', 'true');
  }

  const response = await fetch(`/api/wildfires?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch wildfire telemetry: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Direct backend proxy to Gemini generateContent (key in x-goog-api-key header on server)
 */
export async function callBackendGeminiGenerate(params: {
  model?: string;
  contents: any;
  generationConfig?: any;
  systemInstruction?: any;
}): Promise<any> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || errData.error || `Server Gemini error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check backend telemetry status and NASA API connection health
 */
export async function fetchTelemetryStatus(): Promise<TelemetryStatus> {
  const response = await fetch('/api/telemetry/status');
  if (!response.ok) {
    throw new Error(`Backend telemetry status unreachable: ${response.statusText}`);
  }
  return response.json();
}
