import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { lngLatAltToLocalMeters, originLngLat } from '../utils/utils';
import * as THREE from 'three';

const BASE_MAPS = {
  arcgis: {
    id: "arcgis",
    name: "ArcGIS World Imagery",
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    ]
  },
  osm: {
    id: "osm",
    name: "OpenStreetMap",
    tiles: [
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    ]
  }
};

// export default function MapView({ onKeyPress }) {
  const MapView = forwardRef(({ onKeyPress }, ref) => {
    const containerRef = useRef(null); // For DOM node
    const mapInstanceRef = useRef(null); // For MapLibre Map instance
    
    const switchBaseMap = (baseId) => {
    const base = BASE_MAPS[baseId];
    const map = mapInstanceRef.current;
    if (!base || !map) return;

    // If the source exists, just update its tiles array.
    if (map.getSource("base-source")) {
      map.getSource("base-source").setTiles(base.tiles);
    } else {
      // Remove any existing base source and layer, then add the new one.
      if (map.getLayer("base")) map.removeLayer("base");
      if (map.getSource("base-source")) map.removeSource("base-source");
      map.addSource("base-source", {
        type: "raster",
        tiles: base.tiles,
        tileSize: 256,
        minzoom: 0,
        maxzoom: 18
      });
      map.addLayer({
        id: "base",
        type: "raster",
        source: "base-source"
      }, "three-layer");
    }
  };

    useImperativeHandle(ref, () => ({
      getMap: () => mapInstanceRef.current,
      switchBaseMap,
    }));
  
    useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style:{
        version: 8,
        sources: {
          arcgis: {
            type: 'raster',
            tiles: [
              'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            minzoom: 0,
            maxzoom: 18
          }
        },
        layers: [{
          id: 'base',
          type: 'raster',
          source: 'arcgis'
        }],
      },
      
      zoom: 18,
      
      center: [120.6325982, 24.04898052],
      pitch: 60,
      canvasContextAttributes: {antialias: true} // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });
      mapInstanceRef.current = map; // <--- Store MapLibre Map here
  
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        const zoom = map.getZoom();
        const origin = map.getCenter();
        const pos = lngLatAltToLocalMeters(lng, lat, origin.lng, origin.lat);
        console.log('Three.js position:', pos);
        console.log('click lng, lat', lng, lat);
        const layer = map.getLayer('three-layer')
        //layer.implementation.raycast(lng, lat);
        layer.implementation.raycast(e.point);
      });
      map.on("mousemove", (e) => {if(map.getLayer('three-layer')) {
        // const layer = map.getLayer('three-layer')
        // layer.implementation.raycast(e.point);
      }});
      const handleKeyDown = (e) => {
        onKeyPress?.(e.key);
      };
      window.addEventListener('keydown', handleKeyDown);
  
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        map.remove();
      };
    }, []);
  
    return (
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-full z-0"
        style={{ backgroundColor: '#e0e0e0' }}
      />
    );
  });
  
  export default MapView;