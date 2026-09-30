import React, { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { CommunityFieldReport, WardRegion } from '../../types';
import { ZoomIn, ZoomOut, Compass, Globe, Sun, Moon, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

interface ReportsMapProps {
  reports: CommunityFieldReport[];
  selectedReportId: string | null;
  onSelectReport: (id: string) => void;
  wards: WardRegion[];
}

export const ReportsMap: React.FC<ReportsMapProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  wards,
}) => {
  const { isOpsMode, setOpsMode } = useStore();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useRealMap, setUseRealMap] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Geographic center for Pauri Garhwal / Kotdwar
  const pauriCenter: [number, number] = [78.535, 29.752];

  // Combined ESRI World Canvas tile style with both Light and Dark sources
  const esriCombinedStyle: any = {
    version: 8,
    sources: {
      'esri-light': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: '© Esri, USGS, NOAA',
      },
      'esri-light-ref': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
      },
      'esri-dark': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: '© Esri, USGS, NOAA',
      },
      'esri-dark-ref': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: 'esri-light-tiles',
        type: 'raster',
        source: 'esri-light',
        minzoom: 0,
        maxzoom: 19,
        layout: { visibility: !isOpsMode ? 'visible' : 'none' },
      },
      {
        id: 'esri-light-labels',
        type: 'raster',
        source: 'esri-light-ref',
        minzoom: 0,
        maxzoom: 19,
        layout: { visibility: !isOpsMode ? 'visible' : 'none' },
      },
      {
        id: 'esri-dark-tiles',
        type: 'raster',
        source: 'esri-dark',
        minzoom: 0,
        maxzoom: 19,
        layout: { visibility: isOpsMode ? 'visible' : 'none' },
      },
      {
        id: 'esri-dark-labels',
        type: 'raster',
        source: 'esri-dark-ref',
        minzoom: 0,
        maxzoom: 19,
        layout: { visibility: isOpsMode ? 'visible' : 'none' },
      },
    ],
  };

  // Helper to ensure polygon ring is closed for GeoJSON specs
  const closePolygonRing = (polygon: [number, number][]) => {
    if (!polygon || polygon.length === 0) return [];
    const ring = polygon.map(coord => [coord[1], coord[0]]); // [lng, lat]
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([first[0], first[1]]);
    }
    return ring;
  };

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: esriCombinedStyle,
        center: pauriCenter,
        zoom: 12.0,
        pitch: 20,
        bearing: -6,
        attributionControl: false,
      });

      map.on('load', () => {
        setMapLoaded(true);

        // 1. Add Wards GeoJSON Source
        const wardsGeoJson: any = {
          type: 'FeatureCollection',
          features: wards.map(ward => ({
            type: 'Feature',
            id: ward.id,
            properties: {
              id: ward.id,
              name: ward.name,
              riskLevel: ward.riskLevel,
            },
            geometry: {
              type: 'Polygon',
              coordinates: [closePolygonRing(ward.polygon)],
            },
          })),
        };

        map.addSource('wards-geojson', {
          type: 'geojson',
          data: wardsGeoJson,
        });

        // Wards Fill Layer
        map.addLayer({
          id: 'wards-fill-layer',
          type: 'fill',
          source: 'wards-geojson',
          paint: {
            'fill-color': [
              'match',
              ['get', 'riskLevel'],
              'critical', 'rgba(229, 72, 77, 0.16)',
              'warning', 'rgba(232, 132, 58, 0.12)',
              'advisory', 'rgba(217, 180, 74, 0.09)',
              /* default/safe */ 'rgba(76, 183, 130, 0.08)'
            ],
            'fill-opacity': 0.8,
          },
        });

        // Wards Outline Layer
        map.addLayer({
          id: 'wards-outline-layer',
          type: 'line',
          source: 'wards-geojson',
          paint: {
            'line-color': [
              'match',
              ['get', 'riskLevel'],
              'critical', '#E5484D',
              'warning', '#E8843A',
              'advisory', '#D9B44A',
              /* default */ '#4CB782'
            ],
            'line-width': 1.6,
            'line-opacity': 0.75,
            'line-dasharray': [3, 2],
          },
        });

        // 2. Add Khoh River Torrent Line
        const riverGeoJson: any = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'Khoh Riverbed' },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [78.508, 29.722],
                  [78.518, 29.734],
                  [78.528, 29.746],
                  [78.536, 29.758],
                  [78.548, 29.768],
                  [78.562, 29.778],
                ],
              },
            },
          ],
        };

        map.addSource('river-torrent', {
          type: 'geojson',
          data: riverGeoJson,
        });

        map.addLayer({
          id: 'river-torrent-casing',
          type: 'line',
          source: 'river-torrent',
          paint: {
            'line-color': isOpsMode ? '#132B3A' : '#D0E4E7',
            'line-width': 10,
            'line-opacity': 0.5,
          },
        });

        map.addLayer({
          id: 'river-torrent-stream',
          type: 'line',
          source: 'river-torrent',
          paint: {
            'line-color': isOpsMode ? '#5CC8BE' : '#0D9488',
            'line-width': 2.0,
            'line-dasharray': [4, 3],
            'line-opacity': 0.8,
          },
        });
      });

      mapRef.current = map;
      setMapInstance(map);

      return () => {
        map.remove();
        setMapInstance(null);
      };
    } catch (err) {
      console.warn('MapLibre GL failed to initialize in reports:', err);
      setUseRealMap(false);
    }
  }, []);

  // Sync Theme (Light / Dark) for MapLibre Basemaps
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (map.getLayer('esri-light-tiles')) {
      map.setLayoutProperty('esri-light-tiles', 'visibility', !isOpsMode ? 'visible' : 'none');
    }
    if (map.getLayer('esri-light-labels')) {
      map.setLayoutProperty('esri-light-labels', 'visibility', !isOpsMode ? 'visible' : 'none');
    }
    if (map.getLayer('esri-dark-tiles')) {
      map.setLayoutProperty('esri-dark-tiles', 'visibility', isOpsMode ? 'visible' : 'none');
    }
    if (map.getLayer('esri-dark-labels')) {
      map.setLayoutProperty('esri-dark-labels', 'visibility', isOpsMode ? 'visible' : 'none');
    }

    if (map.getLayer('river-torrent-stream')) {
      map.setPaintProperty('river-torrent-stream', 'line-color', isOpsMode ? '#5CC8BE' : '#0D9488');
    }
    if (map.getLayer('river-torrent-casing')) {
      map.setPaintProperty('river-torrent-casing', 'line-color', isOpsMode ? '#132B3A' : '#D0E4E7');
    }
  }, [isOpsMode, mapLoaded]);

  // Sync Report Markers on MapLibre
  useEffect(() => {
    const map = mapInstance;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    reports.forEach((rep, idx) => {
      const ward = wards.find(w => w.id === rep.wardId);
      const lat = rep.lat ?? (ward ? ward.lat + (idx * 0.004 - 0.004) : 29.7475);
      const lng = rep.lng ?? (ward ? ward.lng + (idx * 0.004 - 0.004) : 78.5305);

      const isSelected = rep.id === selectedReportId;
      const isVerified = rep.status === 'verified';
      const isUrgent = rep.urgency === 'critical' || rep.status === 'urgent';
      const isWarning = rep.urgency === 'high';

      const beaconColor = isVerified 
        ? '#4CB782' 
        : isUrgent 
          ? '#E5484D' 
          : isWarning 
            ? '#E8843A' 
            : '#5CC8BE';

      const cardBg = isOpsMode ? 'rgba(16, 22, 27, 0.92)' : 'rgba(255, 255, 255, 0.95)';
      const cardBorder = isSelected 
        ? (isOpsMode ? '#5CC8BE' : '#0D9488') 
        : isUrgent 
          ? '#E5484D' 
          : (isOpsMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(18, 24, 29, 0.15)');
      const cardTextColor = isOpsMode ? '#FFFFFF' : '#111827';
      const cardShadow = isOpsMode 
        ? (isSelected ? '0 0 20px rgba(92, 200, 190, 0.35)' : '0 4px 14px rgba(0, 0, 0, 0.6)') 
        : (isSelected ? '0 0 16px rgba(13, 148, 136, 0.35)' : '0 4px 14px rgba(0, 0, 0, 0.12)');

      const el = document.createElement('div');
      el.className = 'group cursor-pointer select-none flex flex-col items-center pointer-events-auto transition-transform hover:scale-110';
      el.innerHTML = `
        <div style="
          background: ${cardBg};
          border: 1.5px solid ${cardBorder};
          box-shadow: ${cardShadow};
          padding: 4px 10px;
          border-radius: 6px;
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transform: translateY(${isSelected ? '-3px' : '0'});
          transition: all 0.2s ease-out;
        ">
          <span style="
            width: 8px; 
            height: 8px; 
            border-radius: 50%; 
            background-color: ${beaconColor}; 
            ${isUrgent ? 'box-shadow: 0 0 10px #E5484D;' : ''}
          "></span>
          <span style="font-size: 11px; font-weight: 600; color: ${cardTextColor}; font-family: monospace; letter-spacing: -0.01em;">
            ${rep.category.replace('_', ' ')}
          </span>
          <span style="font-size: 9px; font-weight: 700; color: ${beaconColor}; text-transform: uppercase;">
            ${rep.status}
          </span>
        </div>
        <div style="
          width: 0; 
          height: 0; 
          border-left: 5px solid transparent; 
          border-right: 5px solid transparent; 
          border-top: 5px solid ${cardBorder};
          margin-top: -1px;
        "></div>
      `;

      el.onclick = (e) => {
        e.stopPropagation();
        onSelectReport(rep.id);
      };

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [reports, wards, selectedReportId, isOpsMode, mapInstance]);

  // Fly to selected report on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !selectedReportId) return;

    const rep = reports.find(r => r.id === selectedReportId);
    if (rep) {
      const ward = wards.find(w => w.id === rep.wardId);
      const lat = rep.lat ?? (ward ? ward.lat : 29.7475);
      const lng = rep.lng ?? (ward ? ward.lng : 78.5305);
      map.flyTo({
        center: [lng, lat],
        zoom: 13.5,
        pitch: 28,
        duration: 900,
      });
    }
  }, [selectedReportId, reports, wards, mapLoaded]);

  // SVG Projection for Fallback / Relief view
  const minLat = 29.70, maxLat = 29.80;
  const minLng = 78.49, maxLng = 78.58;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    const y = 700 - ((lat - minLat) / (maxLat - minLat)) * 700;
    return { x, y };
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-zd-base">
      {/* 1. Real MapLibre GL Tile Map Container (Pauri Garhwal) */}
      <div
        ref={mapContainerRef}
        className={clsx(
          "absolute inset-0 w-full h-full transition-opacity duration-300",
          useRealMap ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
        )}
      />

      {/* 2. Fallback SVG Map */}
      <div 
        className={clsx(
          "absolute inset-0 w-full h-full transition-opacity duration-300",
          !useRealMap ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
        )}
      >
        <div className={clsx(
          "absolute inset-0 pointer-events-none overflow-hidden",
          isOpsMode ? "opacity-30 mix-blend-luminosity" : "opacity-25 mix-blend-multiply"
        )}>
          <img
            src="/assets/terrain-dark.webp"
            alt="Topographic Hillshade"
            className="w-full h-full object-cover"
          />
          <div className={clsx(
            "absolute inset-0",
            isOpsMode 
              ? "bg-gradient-to-t from-zd-base via-zd-base/30 to-zd-base/70"
              : "bg-gradient-to-t from-zd-base via-zd-base/20 to-transparent"
          )} />
        </div>

        <svg
          className="w-full h-full relative"
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid meet"
          style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.25s ease-out' }}
        >
          <defs>
            <pattern id="reportsGrid2" width="50" height="50" patternUnits="userSpaceOnUse">
              <path 
                d="M 50 0 L 0 0 0 50" 
                fill="none" 
                stroke={isOpsMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.06)"} 
                strokeWidth="0.5" 
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#reportsGrid2)" />

          {/* Rivers */}
          <path
            d="M 120 660 C 260 610, 420 540, 530 400 C 620 290, 740 230, 940 180"
            fill="none"
            stroke={isOpsMode ? "#5CC8BE" : "#0D9488"}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            opacity="0.8"
          />

          {/* Report Pins */}
          {reports.map((rep) => {
            const pt = project(rep.lat, rep.lng);
            const isSelected = selectedReportId === rep.id;
            const isUrgent = rep.urgency === 'critical' || rep.status === 'urgent';
            const color = rep.status === 'verified' ? '#4CB782' : isUrgent ? '#E5484D' : '#E8843A';

            return (
              <g
                key={rep.id}
                transform={`translate(${pt.x}, ${pt.y})`}
                onClick={() => onSelectReport(rep.id)}
                className="cursor-pointer group"
              >
                {isSelected && (
                  <circle r="20" fill="none" stroke={color} strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                )}
                <circle
                  r={isSelected ? 10 : 7}
                  fill={color}
                  stroke={isOpsMode ? "#0A0F13" : "#FFFFFF"}
                  strokeWidth="2"
                />
                <text
                  x="14"
                  y="4"
                  fill={isOpsMode ? "#FFFFFF" : "#111827"}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  style={{
                    paintOrder: 'stroke fill',
                    stroke: isOpsMode ? '#0A0F13' : '#FFFFFF',
                    strokeWidth: '3px'
                  }}
                >
                  {rep.category.replace('_', ' ')}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. Bottom Controls: Real Map Switcher, Light/Dark Option & Location Tag */}
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2 flex-wrap">
        {/* Toggle Real Map vs Relief */}
        <button
          onClick={() => setUseRealMap(!useRealMap)}
          className="h-8 px-2.5 rounded-control bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-text text-xs flex items-center gap-1.5 transition-colors shadow-sm font-sans backdrop-blur"
          title="Toggle Real Map of Pauri Garhwal vs Hillshade Relief"
        >
          <Globe className="w-3.5 h-3.5 text-zd-accent" />
          <span>{useRealMap ? 'Real Pauri Garhwal Map' : 'Hillshade Relief'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sev-safe" />
        </button>

        {/* Light / Dark Mode Toggle Option */}
        <div className="h-8 p-0.5 rounded-control bg-zd-surface/90 border border-zd-border flex items-center shadow-sm backdrop-blur">
          <button
            onClick={() => setOpsMode(false)}
            className={clsx(
              "h-7 px-2.5 rounded flex items-center gap-1.5 text-xs font-sans transition-all",
              !isOpsMode 
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold shadow-xs border border-amber-500/30" 
                : "text-zd-muted hover:text-zd-text"
            )}
            title="Switch map to Light Mode"
            aria-label="Light mode"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
            <span>Light</span>
          </button>
          <button
            onClick={() => setOpsMode(true)}
            className={clsx(
              "h-7 px-2.5 rounded flex items-center gap-1.5 text-xs font-sans transition-all",
              isOpsMode 
                ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold shadow-xs border border-cyan-500/30" 
                : "text-zd-muted hover:text-zd-text"
            )}
            title="Switch map to Dark Mode"
            aria-label="Dark mode"
          >
            <Moon className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2} />
            <span>Dark</span>
          </button>
        </div>

        {useRealMap && (
          <span className="hidden sm:inline-block text-[11px] font-mono text-zd-dim bg-zd-surface/80 px-2 py-1 rounded border border-zd-border/60 backdrop-blur">
            Pauri Garhwal · {isOpsMode ? 'Dark' : 'Light'} Basemap · {reports.length} Field Pins
          </span>
        )}
      </div>

      {/* 4. Zoom & Navigation Controls */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => {
            if (useRealMap && mapRef.current) {
              mapRef.current.zoomIn();
            } else {
              setZoomLevel(z => Math.min(z + 0.25, 2.5));
            }
          }}
          className="w-8 h-8 rounded-control bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-muted hover:text-zd-text flex items-center justify-center transition-colors shadow-sm"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => {
            if (useRealMap && mapRef.current) {
              mapRef.current.zoomOut();
            } else {
              setZoomLevel(z => Math.max(z - 0.25, 0.75));
            }
          }}
          className="w-8 h-8 rounded-control bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-muted hover:text-zd-text flex items-center justify-center transition-colors shadow-sm"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
        </button>
        {useRealMap && (
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.flyTo({ center: pauriCenter, zoom: 12.0, pitch: 20, bearing: -6, duration: 800 });
              }
            }}
            className="w-8 h-8 rounded-control bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-muted hover:text-zd-accent flex items-center justify-center transition-colors shadow-sm"
            title="Reset to Pauri Garhwal Center"
            aria-label="Reset Compass"
          >
            <Compass className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
};
