import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import maplibregl from 'maplibre-gl';
import { originTransform, originCameraMatrix } from './utils';

const ThreeScene = forwardRef(({ mapRef }, ref) => {
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(new THREE.PerspectiveCamera());
  const rendererRef = useRef(null);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(0, 100, 100).normalize();
  sceneRef.current.add(directionalLight);
  
  var addLineFlag = false;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const cameraGroup = new THREE.Group();
  sceneRef.current.add(cameraGroup);
  function onPointerMove( event ) {
    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
  }
  // Expose a method to add a cube at a lng/lat/height
  useImperativeHandle(ref, () => ({
    addCubeAt: (lng, lat, height = 0) => {
      
      const merc = maplibregl.MercatorCoordinate.fromLngLat([lng, lat], height);
      const scale = 1;
      const size = 1 * scale; // 10 meters in size (adjust as needed)

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshStandardMaterial({ color: 0xff0000 })
      );
      
      const localX = (merc.x - originTransform.translateX) / originTransform.scale;
      const localY = (merc.y - originTransform.translateY) / originTransform.scale;
      const localZ = (merc.z - originTransform.translateZ) / originTransform.scale;

      cube.position.set(merc.x, merc.y, merc.z + size / 2); // Place cube on map at correct altitude
            
      cube.position.set(localX, localZ, localY);
      //cube.geometry.computeBoundingBox();
      //cameraGroup.add(cube);
      sceneRef.current.add(cube);
      console.log("cube pos:", localX, localY, localZ, "scale: ", size);
      console.log("merc: ", merc.x, merc.y, merc.z)
      // const cube = new THREE.Mesh(
      //   new THREE.BoxGeometry(10, 10, 10),
      //   new THREE.MeshBasicMaterial({ color: 0xff0000 })
      // );
      // console.log('scene children:', sceneRef.current.children);
      // Optionally trigger a repaint
      mapRef.current?.getMap()?.triggerRepaint();
    },
    addRayDebug: () => {
      //addLineFlag = true;
      console.log(sceneRef.current.children);
    }
  }));

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    function addThreeLayer() {
      if (map.getLayer('three-layer')) return;
      map.addLayer({
        id: 'three-layer',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
          rendererRef.current = new THREE.WebGLRenderer({
            context: gl,
            antialias: true,
            canvas: map.getCanvas()
          });
          rendererRef.current.autoClear = false;
          rendererRef.current.setClearColor(0xaaaaaa, 0); // grey background for debug
        },
        render: function (gl, matrix) {
          if (!rendererRef.current) return;
          

          const cameraMatrix = originCameraMatrix(matrix, map.getCenter());
          cameraRef.current.projectionMatrix = (cameraMatrix);
          cameraRef.current.updateMatrixWorld(true);
          
          
          rendererRef.current.resetState();
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        },
        raycast: function ({x, y}) {
          const {width, height} = map.transform;
          console.log("width, height", width, height)
          const camInverseProjection = cameraRef.current.projectionMatrix.clone().invert();
          
          const cameraPosition = new THREE.Vector3().applyMatrix4(camInverseProjection);
          console.log("cameraPosition", cameraPosition)
          const mousePosition = new THREE.Vector3(
            (x / width) * 2 - 1, 1 - (y / height) * 2, 1,
          ).applyMatrix4(camInverseProjection);
          console.log("mousePosition", mousePosition)
          const viewDirection = mousePosition.sub(cameraPosition).normalize();
          console.log("viewDirection", viewDirection)
          raycaster.set(cameraPosition, viewDirection);
          
          // calculate objects intersecting the picking ray
          var intersects = raycaster.intersectObjects(sceneRef.current.children, true);
          console.log(intersects)
          for ( let i = 0; i < intersects.length; i ++ ) {

            intersects[ i ].object.material.color.set( 0x0000ff );
        
          }
          
        }
      });
    }

    if (map.isStyleLoaded()) {
      addThreeLayer();
    } else {
      map.once('style.load', addThreeLayer);
    }
    window.addEventListener('pointermove', onPointerMove);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [mapRef]);

  return null;
});

export default ThreeScene;