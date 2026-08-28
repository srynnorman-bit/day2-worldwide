import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AsteroidsView } from './components/views/AsteroidsView';
import { VolcanoesView } from './components/views/VolcanoesView';
import { EarthquakesView } from './components/views/EarthquakesView';
import { WildfireView } from './components/views/WildfireView';
import { GenericThreatView } from './components/views/GenericThreatView';
import { GlobalStatsModal } from './components/modals/GlobalStatsModal';
import { ThreatMatrixModal } from './components/modals/ThreatMatrixModal';
import { SatelliteFeedsModal } from './components/modals/SatelliteFeedsModal';
import { OperatorModal } from './components/modals/OperatorModal';
import { DetailInspectorModal } from './components/modals/DetailInspectorModal';
import { KardashevScaleModal } from './components/modals/KardashevScaleModal';
import { DisqusComments } from './components/DisqusComments';
import {
  ASTEROID_OBJECTS,
  MONITORING_FEEDS,
  VOLCANO_EVENTS,
  EARTHQUAKE_EVENTS,
  WILDFIRE_EVENTS,
} from './data/threatData';
import {
  AsteroidObject,
  EarthquakeEvent,
  GlobalNavTab,
  ThreatCategory,
  VolcanoEvent,
  WildfireEvent,
} from './types';
import { fetchLiveAsteroids, fetchLiveWildfires, fetchTelemetryStatus } from './services/telemetryApi';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<ThreatCategory>('asteroids-and-comets');
  const [extinctionProbability, setExtinctionProbability] = useState<number>(12.04);
  const [activeNavTab, setActiveNavTab] = useState<GlobalNavTab>('threat-view');
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Live NASA NeoWs Asteroid State
  const [asteroids, setAsteroids] = useState<AsteroidObject[]>(ASTEROID_OBJECTS);
  const [isLoadingAsteroids, setIsLoadingAsteroids] = useState<boolean>(false);
  const [asteroidFeedSource, setAsteroidFeedSource] = useState<'NASA_NEOWS_LIVE' | 'TELEMETRY_FALLBACK'>('NASA_NEOWS_LIVE');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [totalNeosCount, setTotalNeosCount] = useState<number>(ASTEROID_OBJECTS.length);

  // Live NASA EONET Wildfire State
  const [wildfires, setWildfires] = useState<WildfireEvent[]>(WILDFIRE_EVENTS);
  const [isLoadingWildfires, setIsLoadingWildfires] = useState<boolean>(false);
  const [wildfireFeedSource, setWildfireFeedSource] = useState<'NASA_EONET_LIVE' | 'TELEMETRY_CATALOG' | 'TELEMETRY_FALLBACK'>('NASA_EONET_LIVE');
  const [wildfireDaysWindow, setWildfireDaysWindow] = useState<number>(60);
  const [wildfireStatusFilter, setWildfireStatusFilter] = useState<string>('open');
  const [wildfireApiMessage, setWildfireApiMessage] = useState<string>('');

  // Detail Inspector Modal State
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [selectedInspectObject, setSelectedInspectObject] = useState<
    AsteroidObject | VolcanoEvent | EarthquakeEvent | WildfireEvent | null
  >(null);
  const [inspectObjectType, setInspectObjectType] = useState<
    'asteroid' | 'volcano' | 'earthquake' | 'wildfire' | null
  >(null);

  // SitRep draft prefill state
  const [prefilledDraftMessage, setPrefilledDraftMessage] = useState<string>('');

  const handleJumpToDiscussions = () => {
    setActiveNavTab('threat-view');
    setTimeout(() => {
      const el = document.getElementById('tactical-discussions');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleDiscussInSitRep = (draft: string) => {
    setPrefilledDraftMessage(draft);
    handleJumpToDiscussions();
  };

  // Initial Telemetry Fetch for Asteroids
  const loadAsteroidData = async (start?: string, end?: string) => {
    setIsLoadingAsteroids(true);
    try {
      const res = await fetchLiveAsteroids(start || startDate, end || endDate);
      if (res.asteroids && res.asteroids.length > 0) {
        setAsteroids(res.asteroids);
        setAsteroidFeedSource(res.source);
        setTotalNeosCount(res.elementCount);
      }
    } catch (err: any) {
      console.warn('Live NASA NeoWs fetch failed; retaining active catalog:', err);
      setAsteroidFeedSource('TELEMETRY_FALLBACK');
    } finally {
      setIsLoadingAsteroids(false);
    }
  };

  // Live NASA EONET Wildfire Telemetry Fetch
  const loadWildfireData = async (
    days: number = wildfireDaysWindow,
    status: string = wildfireStatusFilter,
    forceFallback: boolean = false
  ) => {
    setIsLoadingWildfires(true);
    try {
      const res = await fetchLiveWildfires(days, status, 100, forceFallback);
      setWildfires(res.wildfires || []);
      setWildfireFeedSource(res.source);
      setWildfireDaysWindow(days);
      setWildfireStatusFilter(status);
      setWildfireApiMessage(res.message || '');
    } catch (err: any) {
      console.warn('Live NASA EONET Wildfire fetch failed; retaining catalog:', err);
      setWildfireFeedSource('TELEMETRY_FALLBACK');
      setWildfireApiMessage(err.message || 'NASA EONET Service Unavailable');
    } finally {
      setIsLoadingWildfires(false);
    }
  };

  useEffect(() => {
    loadAsteroidData();
    loadWildfireData();
  }, []);

  const handleFetchDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    loadAsteroidData(start, end);
  };

  const handleFetchWildfireDays = (days: number, status?: string) => {
    loadWildfireData(days, status || wildfireStatusFilter);
  };

  const handleLoadWildfireFallbackCatalog = () => {
    loadWildfireData(wildfireDaysWindow, wildfireStatusFilter, true);
  };

  const handleRefreshWildfires = () => {
    loadWildfireData(wildfireDaysWindow, wildfireStatusFilter, false);
  };

  const handleInspectAsteroid = (ast: AsteroidObject) => {
    setSelectedInspectObject(ast);
    setInspectObjectType('asteroid');
    setInspectorOpen(true);
  };

  const handleInspectVolcano = (v: VolcanoEvent) => {
    setSelectedInspectObject(v);
    setInspectObjectType('volcano');
    setInspectorOpen(true);
  };

  const handleInspectEarthquake = (eq: EarthquakeEvent) => {
    setSelectedInspectObject(eq);
    setInspectObjectType('earthquake');
    setInspectorOpen(true);
  };

  const handleInspectWildfire = (wf: WildfireEvent) => {
    setSelectedInspectObject(wf);
    setInspectObjectType('wildfire');
    setInspectorOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#131313] text-[#e2e2e2] selection:bg-[#00F2FF] selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setActiveNavTab('threat-view');
        }}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onOpenKardashev={() => setActiveNavTab('kardashev-scale')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 w-full min-w-0">
        {/* Fixed Header */}
        <Header
          extinctionProbability={extinctionProbability}
          activeNavTab={activeNavTab}
          onSelectNavTab={(tab) => setActiveNavTab(tab)}
          onOpenOperatorModal={() => setIsOperatorModalOpen(true)}
          onJumpToDiscussions={handleJumpToDiscussions}
          operatorId="OPERATOR_01"
          operatorClearance="S_LEVEL_CLEARANCE"
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          kardashevRating={0.727}
        />

        {/* Dynamic Route Display */}
        <main className="flex-1 mt-16 w-full overflow-x-hidden">
          {activeCategory === 'asteroids-and-comets' && (
            <AsteroidsView
              asteroids={asteroids}
              monitoringFeeds={MONITORING_FEEDS}
              extinctionProbability={extinctionProbability}
              onUpdateExtinctionProbability={setExtinctionProbability}
              onSelectAsteroid={handleInspectAsteroid}
              isLoadingLiveFeed={isLoadingAsteroids}
              feedSource={asteroidFeedSource}
              startDate={startDate}
              endDate={endDate}
              onFetchDateRange={handleFetchDateRange}
              totalElementCount={totalNeosCount}
            />
          )}

          {activeCategory === 'volcanoes' && (
            <VolcanoesView
              volcanoes={VOLCANO_EVENTS}
              onSelectVolcano={handleInspectVolcano}
            />
          )}

          {activeCategory === 'earthquakes' && (
            <EarthquakesView
              earthquakes={EARTHQUAKE_EVENTS}
              onSelectEarthquake={handleInspectEarthquake}
            />
          )}

          {activeCategory === 'wildfire' && (
            <WildfireView
              wildfires={wildfires}
              onSelectWildfire={handleInspectWildfire}
              isLoading={isLoadingWildfires}
              feedSource={wildfireFeedSource}
              daysWindow={wildfireDaysWindow}
              statusFilter={wildfireStatusFilter}
              onFetchDaysWindow={handleFetchWildfireDays}
              onLoadFallbackCatalog={handleLoadWildfireFallbackCatalog}
              onRefresh={handleRefreshWildfires}
              apiMessage={wildfireApiMessage}
            />
          )}

          {activeCategory !== 'asteroids-and-comets' &&
            activeCategory !== 'volcanoes' &&
            activeCategory !== 'earthquakes' &&
            activeCategory !== 'wildfire' && (
              <GenericThreatView category={activeCategory} />
            )}

          {/* Disqus Community Discussion Stream */}
          <DisqusComments
            pageIdentifier={`threat-category-${activeCategory}`}
            categoryTitle={`OPERATIONAL DISCUSSION // ${activeCategory.toUpperCase().replace(/-/g, ' ')}`}
            category={activeCategory}
            prefilledDraft={prefilledDraftMessage}
            onClearPrefilledDraft={() => setPrefilledDraftMessage('')}
          />
        </main>
      </div>

      {/* Global Modals */}
      <KardashevScaleModal
        isOpen={activeNavTab === 'kardashev-scale'}
        onClose={() => setActiveNavTab('threat-view')}
        extinctionProbability={extinctionProbability}
      />

      <GlobalStatsModal
        isOpen={activeNavTab === 'global-stats'}
        onClose={() => setActiveNavTab('threat-view')}
        extinctionProbability={extinctionProbability}
        onSetExtinctionProbability={setExtinctionProbability}
        onOpenKardashev={() => setActiveNavTab('kardashev-scale')}
      />

      <ThreatMatrixModal
        isOpen={activeNavTab === 'threat-matrix'}
        onClose={() => setActiveNavTab('threat-view')}
      />

      <SatelliteFeedsModal
        isOpen={activeNavTab === 'satellite-feeds'}
        onClose={() => setActiveNavTab('threat-view')}
      />

      <OperatorModal
        isOpen={isOperatorModalOpen}
        onClose={() => setIsOperatorModalOpen(false)}
        operatorId="OPERATOR_01"
        operatorClearance="S_LEVEL_CLEARANCE"
      />

      <DetailInspectorModal
        isOpen={inspectorOpen}
        onClose={() => {
          setInspectorOpen(false);
          setSelectedInspectObject(null);
          setInspectObjectType(null);
        }}
        selectedObject={selectedInspectObject}
        objectType={inspectObjectType}
        onDiscussInSitRep={handleDiscussInSitRep}
      />
    </div>
  );
}
