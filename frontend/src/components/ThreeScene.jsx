// ThreeScene.jsx
import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import ThreeManager from '../three/ThreeManager';

const ThreeScene = forwardRef(({ mapRef, onMeshClick}, ref) => {
  const managerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    addCubeAt: (...args) => managerRef.current?.addCubeAt(...args),
    addRayDebug: () => console.log(managerRef.current?.scene.children),
  }));

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const canvas = map.getCanvas();

    managerRef.current = new ThreeManager(map, canvas);

    function addThreeLayer() {
      if (map.getLayer('three-layer')) return;
      const mapLayer = {
        id: 'three-layer',
        type: 'custom',
        renderingMode: '3d',
        onAdd: (map, gl) => {
          // Manager already using map's canvas/context
        },
        render: (gl, matrix) => {
          managerRef.current?.render(matrix);
        },
        raycast: (xy) => {
          const intersect = managerRef.current?.raycast(xy);
          onMeshClick(intersect?.object.userData.gpsData);
        },
      };
      map.addLayer(mapLayer);
    }

    if (map.isStyleLoaded()) {
      addThreeLayer();
    } else {
      map.once('style.load', addThreeLayer);
    }

    return () => {
      managerRef.current?.dispose();
    };
  }, [mapRef]);

  return null;
});

export default ThreeScene;