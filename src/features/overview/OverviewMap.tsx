import React, { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { WardRegion, SensorNode, ShelterPoint } from '../../types';
import { ZoomIn, ZoomOut, Compass, MapPin, Layers, Radio, Globe, Sun, Moon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

interface OverviewMapProps {
  wards: WardRegion[];
  sensors: SensorNode[];
  shelters: ShelterPoint[];
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  hoveredWardId: string | null;
  onHoverWard: (wardId: string | null) => void;
  layers: {
    wards: boolean;
    sensors: boolean;
    shelters: boolean;
    rainfall: boolean;
    rivers: boolean;
    susceptibility: boolean;
  };
}

export const OverviewMap: React.FC<OverviewMapProps> = ({
  wards,
  sensors,
  shelters,
  selectedWardId,
  onSelectWard,
  hoveredWardId,
  onHoverWard,
  layers,
}) => {
  const { isOpsMode, setOpsMode } = useStore();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useRealMap, setUseRealMap] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Geographic center for Kotdwar & Pauri Garhwal
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
        zoom: 11.8,
        pitch: 24,
        bearing: -8,
        attributionControl: false,
      });

      map.on('load', () => {
        setMapLoaded(true);

        // 1. Add Wards GeoJSON Source with valid closed rings
        const wardsGeoJson: any = {
          type: 'FeatureCollection',
          features: wards.map(ward => ({
            type: 'Feature',
            id: ward.id,
            properties: {
              id: ward.id,
              name: ward.name,
              riskLevel: ward.riskLevel,
              riskScore: ward.riskScore,
              riverLevelM: ward.riverLevelM,
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

        // Wards Fill Layer with severity-based colors
        map.addLayer({
          id: 'wards-fill-layer',
          type: 'fill',
          source: 'wards-geojson',
          paint: {
            'fill-color': [
              'match',
              ['get', 'riskLevel'],
              'critical', 'rgba(229, 72, 77, 0.28)',
              'warning', 'rgba(232, 132, 58, 0.22)',
              'advisory', 'rgba(217, 180, 74, 0.18)',
              /* default/safe */ 'rgba(76, 183, 130, 0.16)'
            ],
            'fill-opacity': 0.9,
          },
        });

        // Wards Border Layer
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
            'line-width': 2.0,
            'line-opacity': 0.95,
          },
        });

        // 2. Add Khoh River Torrent Line
        const riverGeoJson: any = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'Khoh Riverbed Surge' },
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
            'line-color': '#132B3A',
            'line-width': 12,
            'line-opacity': 0.7,
          },
        });

        map.addLayer({
          id: 'river-torrent-stream',
          type: 'line',
          source: 'river-torrent',
          paint: {
            'line-color': '#5CC8BE',
            'line-width': 2.5,
            'line-dasharray': [4, 3],
            'line-opacity': 0.85,
          },
        });

        // Click on ward polygon
        map.on('click', 'wards-fill-layer', (e) => {
          if (e.features && e.features[0]) {
            const wardId = e.features[0].properties?.id;
            if (wardId) onSelectWard(wardId);
          }
        });

        // Hover effect on ward
        map.on('mouseenter', 'wards-fill-layer', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          if (e.features && e.features[0]) {
            const wardId = e.features[0].properties?.id;
            if (wardId) onHoverWard(wardId);
          }
        });

        map.on('mouseleave', 'wards-fill-layer', () => {
          map.getCanvas().style.cursor = '';
          onHoverWard(null);
        });
      });

      mapRef.current = map;
      setMapInstance(map);

      return () => {
        map.remove();
        setMapInstance(null);
      };
    } catch (err) {
      console.warn('MapLibre GL failed to initialize (falling back to SVG):', err);
      setUseRealMap(false);
    }
  }, []);

  // Sync Ward GeoJSON data if wards update
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource('wards-geojson') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: wards.map(ward => ({
          type: 'Feature',
          id: ward.id,
          properties: {
            id: ward.id,
            name: ward.name,
            riskLevel: ward.riskLevel,
            riskScore: ward.riskScore,
            riverLevelM: ward.riverLevelM,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [closePolygonRing(ward.polygon)],
          },
        })),
      });
    }
  }, [wards, mapLoaded]);

  // Sync Visibility of Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const setVisibility = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    setVisibility('wards-fill-layer', layers.wards);
    setVisibility('wards-outline-layer', layers.wards);
    setVisibility('river-torrent-casing', layers.rivers);
    setVisibility('river-torrent-stream', layers.rivers);
  }, [layers, mapLoaded]);

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

  // Sync Markers for Shelters, Sensors, and Ward Labels on MapLibre
  useEffect(() => {
    if (!mapInstance) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // 1. Ward Center Tactical Name Badges (Elevated with anchor pin stem to never collide with ground sensor dots)
    if (layers.wards) {
      wards.forEach(ward => {
        const isSelected = ward.id === selectedWardId;
        const isCritical = ward.riskLevel === 'critical';
        const isWarning = ward.riskLevel === 'warning';
        const color = isCritical ? '#E5484D' : isWarning ? '#E8843A' : ward.riskLevel === 'advisory' ? '#D9B44A' : '#4CB782';

        const cardBg = isOpsMode ? 'rgba(10, 15, 19, 0.94)' : 'rgba(255, 255, 255, 0.96)';
        const cardBorder = isSelected 
          ? (isOpsMode ? '#5CC8BE' : '#0D9488') 
          : isCritical 
            ? '#E5484D' 
            : (isOpsMode ? 'rgba(255, 255, 255, 0.22)' : 'rgba(18, 24, 29, 0.18)');
        const cardTextColor = isOpsMode ? '#FFFFFF' : '#111827';
        const cardShadow = isOpsMode ? '0 4px 16px rgba(0,0,0,0.7)' : '0 4px 14px rgba(0,0,0,0.15)';

        const displayName = ward.name
          .replace(' Lowlands', '')
          .replace(' Gully', '')
          .replace(' Roadway', '')
          .replace(' Upper Foothills', ' Foothills');

        const xOffset = ward.id === 'ward-rampur-4b' ? -8 : ward.id === 'ward-kotdwar-main' ? 8 : 0;

        const el = document.createElement('div');
        el.className = 'group cursor-pointer select-none flex flex-col items-center pointer-events-auto transition-transform hover:scale-110 z-20';
        el.innerHTML = `
          <div style="
            background: ${cardBg};
            border: 1.5px solid ${cardBorder};
            box-shadow: ${cardShadow};
            padding: 4px 10px;
            border-radius: 9999px;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
          ">
            <span style="width: 7px; height: 7px; border-radius: 50%; background-color: ${color}; flex-shrink: 0; ${isCritical ? 'box-shadow: 0 0 8px #E5484D;' : ''}"></span>
            <span style="font-size: 11px; font-weight: 700; color: ${cardTextColor}; letter-spacing: -0.01em;">${displayName}</span>
            <span style="font-size: 10px; font-family: monospace; font-weight: 700; padding: 1px 5px; border-radius: 9999px; background: ${color}22; color: ${color};">${ward.riskScore}</span>
          </div>
          <div style="width: 1.5px; height: 8px; background-color: ${color}; opacity: 0.85;"></div>
          <div style="width: 5px; height: 5px; border-radius: 50%; background-color: ${color}; margin-top: -2px; border: 1px solid ${isOpsMode ? '#0A0F13' : '#FFFFFF'};"></div>
        `;
        el.onclick = (e) => {
          e.stopPropagation();
          onSelectWard(ward.id);
        };

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [xOffset, -3] })
          .setLngLat([ward.lng, ward.lat])
          .addTo(mapInstance);

        markersRef.current.push(marker);
      });
    }

    // 2. Shelters Markers (Distinctive Shield Badges)
    if (layers.shelters) {
      shelters.forEach(shelter => {
        const el = document.createElement('div');
        el.className = 'group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-10';
        el.innerHTML = `
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${isOpsMode ? 'rgba(76, 183, 130, 0.25)' : 'rgba(76, 183, 130, 0.35)'};
            border: 1.5px solid #4CB782;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          ">
            <span style="font-size: 10px; line-height: 1;">🛡️</span>
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-1.5 px-2 py-0.5 rounded text-[10px] font-sans whitespace-nowrap shadow-sm z-30" style="
            background: ${isOpsMode ? '#12181D' : '#FFFFFF'};
            color: ${isOpsMode ? '#FFFFFF' : '#111827'};
            border: 1px solid ${isOpsMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
          ">
            ${shelter.name} (${shelter.capacity} cap)
          </div>
        `;
        el.onclick = (e) => {
          e.stopPropagation();
          onSelectWard(shelter.wardId);
        };

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([shelter.lng, shelter.lat])
          .addTo(mapInstance);

        markersRef.current.push(marker);
      });
    }

    // 3. Sensors Markers (Minimal glowing telemetry nodes on ground, tooltips on hover)
    if (layers.sensors) {
      sensors.forEach(sensor => {
        const isCritical = sensor.healthStatus === 'critical';
        const isWarning = sensor.healthStatus === 'warning';
        const sensorColor = isCritical ? '#E5484D' : isWarning ? '#E8843A' : (isOpsMode ? '#5CC8BE' : '#0D9488');
        const innerBorder = isOpsMode ? '#0A0F13' : '#FFFFFF';

        const el = document.createElement('div');
        el.className = 'group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125 z-10';
        el.innerHTML = `
          <div style="
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: ${sensorColor}33;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background-color: ${sensorColor};
              border: 1px solid ${innerBorder};
              ${isCritical ? 'box-shadow: 0 0 6px #E5484D;' : ''}
            "></div>
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute bottom-full mb-1 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-sm z-30" style="
            background: ${isOpsMode ? '#12181D' : '#FFFFFF'};
            color: ${isOpsMode ? '#FFFFFF' : '#111827'};
            border: 1px solid ${isOpsMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
          ">
            ${sensor.code} (${sensor.type})
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([sensor.lng, sensor.lat])
          .addTo(mapInstance);

        markersRef.current.push(marker);
      });
    }
  }, [wards, shelters, sensors, layers.wards, layers.shelters, layers.sensors, selectedWardId, isOpsMode, mapInstance]);


  // Fly to selected ward on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !selectedWardId) return;

    const ward = wards.find(w => w.id === selectedWardId);
    if (ward) {
      map.flyTo({
        center: [ward.lng, ward.lat],
        zoom: 13.2,
        pitch: 32,
        duration: 900,
      });
    }
  }, [selectedWardId, wards, mapLoaded]);

  // SVG Projection for Fallback / Shaded Relief view
  const minLat = 29.70, maxLat = 29.80;
  const minLng = 78.49, maxLng = 78.58;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    const y = 700 - ((lat - minLat) / (maxLat - minLat)) * 700;
    return { x, y };
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-zd-base">
      {/* 1. Real MapLibre GL Tile Map Container (Pauri Garhwal Coordinates) */}
      <div
        ref={mapContainerRef}
        className={clsx(
          "absolute inset-0 w-full h-full transition-opacity duration-300",
          useRealMap ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
        )}
      />

      {/* 2. Fallback SVG Map (with mountain hillshade relief) */}
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
            <pattern id="surveyGrid2" width="60" height="60" patternUnits="userSpaceOnUse">
              <path 
                d="M 60 0 L 0 0 0 60" 
                fill="none" 
                stroke={isOpsMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.06)"} 
                strokeWidth="0.5" 
              />
              <circle 
                cx="0" 
                cy="0" 
                r="0.6" 
                fill={isOpsMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.12)"} 
              />
            </pattern>
            <pattern id="faintCriticalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#E5484D" strokeWidth="1" strokeOpacity="0.18" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#surveyGrid2)" />

          {/* Rivers */}
          {layers.rivers && (
            <path
              d="M 120 660 C 260 610, 420 540, 530 400 C 620 290, 740 230, 940 180"
              fill="none"
              stroke={isOpsMode ? "#5CC8BE" : "#0D9488"}
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.85"
            />
          )}

          {/* Ward polygons */}
          {layers.wards && wards.map((ward) => {
            const isSelected = selectedWardId === ward.id;
            const isHovered = hoveredWardId === ward.id;
            const points = ward.polygon.map(coord => {
              const pt = project(coord[0], coord[1]);
              return `${pt.x},${pt.y}`;
            }).join(' ');

            const center = project(ward.lat, ward.lng);

            return (
              <g 
                key={ward.id}
                onClick={() => onSelectWard(ward.id)}
                onMouseEnter={() => onHoverWard(ward.id)}
                onMouseLeave={() => onHoverWard(null)}
                className="cursor-pointer"
              >
                <polygon
                  points={points}
                  fill={ward.riskLevel === 'critical' ? 'rgba(229, 72, 77, 0.22)' : 'rgba(76, 183, 130, 0.16)'}
                  stroke={isHovered || isSelected ? (isOpsMode ? '#5CC8BE' : '#0D9488') : ward.riskLevel === 'critical' ? '#E5484D' : '#4CB782'}
                  strokeWidth={isHovered || isSelected ? 2 : 1.5}
                />
                <g transform={`translate(${center.x}, ${center.y})`}>
                  <rect
                    x="-65"
                    y="-12"
                    width="130"
                    height="24"
                    rx="12"
                    fill={isOpsMode ? "rgba(10, 15, 19, 0.92)" : "rgba(255, 255, 255, 0.94)"}
                    stroke={ward.riskLevel === 'critical' ? '#E5484D' : '#4CB782'}
                    strokeWidth="1.2"
                  />
                  <circle
                    cx="-52"
                    cy="0"
                    r="3.5"
                    fill={ward.riskLevel === 'critical' ? '#E5484D' : ward.riskLevel === 'warning' ? '#E8843A' : '#4CB782'}
                  />
                  <text
                    x="-42"
                    y="4"
                    fill={isOpsMode ? "#FFFFFF" : "#111827"}
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {ward.name.length > 15 ? ward.name.slice(0, 13) + '…' : ward.name}
                  </text>
                  <text
                    x="45"
                    y="4"
                    fill={ward.riskLevel === 'critical' ? '#E5484D' : '#4CB782'}
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {ward.riskScore}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3. Real Map Engine Badge, Light/Dark Switcher & Location Tag (Bottom Left) */}
      <div className="absolute bottom-5 left-16 z-20 flex items-center gap-2 flex-wrap">
        {/* Toggle Real Map vs Tactical Hillshade */}
        <button
          onClick={() => setUseRealMap(!useRealMap)}
          className="h-8 px-2.5 rounded-control bg-zd-surface/90 hover:bg-zd-raised border border-zd-border text-zd-text text-xs flex items-center gap-1.5 transition-colors shadow-sm font-sans backdrop-blur"
          title="Toggle Real Map of Pauri Garhwal vs Hillshade Vector"
        >
          <Globe className="w-3.5 h-3.5 text-zd-accent" />
          <span>{useRealMap ? 'Real Pauri Garhwal Map' : 'Hillshade Relief'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sev-safe" />
        </button>

        {/* Overview Map Light / Dark Mode Toggle Option */}
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
            Pauri Garhwal · {isOpsMode ? 'Dark' : 'Light'} Basemap · 29.75°N, 78.53°E
          </span>
        )}
      </div>

      {/* 4. Map Zoom & Navigation Controls (Bottom Right) */}
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
                mapRef.current.flyTo({ center: pauriCenter, zoom: 11.8, pitch: 24, bearing: -8, duration: 800 });
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
