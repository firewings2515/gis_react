// ThreeManager.js
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import maplibregl from 'maplibre-gl';
import { originTransform, originCameraMatrix } from '../utils/utils';
import { generateCameraMesh } from './meshGenereationHelper';

export default class ThreeManager {
  constructor(map, canvas) {
    this.map = map; // maplibre-gl map instance
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.selectedObjects = [];
    //window.addEventListener( 'resize', this.onWindowResize );

    this.renderer = new THREE.WebGLRenderer({
      context: canvas.getContext('webgl'),
      canvas,
      antialias: true,
    });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0xaaaaaa, 1);

    this.composer = new EffectComposer( this.renderer );
    const renderPass = new RenderPass( this.scene, this.camera );
		this.composer.addPass( renderPass );
    this.outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), this.scene, this.camera );
		this.outlinePass.edgeStrength = 5;
		this.outlinePass.edgeGlow = 0.5;
		this.outlinePass.renderToScreen = true;
		this.outlinePass.usePatternTexture  = false;
		this.outlinePass.visibleEdgeColor.set(0xffAA40);
		this.outlinePass.hiddenEdgeColor.set(0xffAA40);

		this.composer.addPass( this.outlinePass );


    // Directional light (like sunlight)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(50, 100, 50);
    this.scene.add(dirLight);

    // Optionally, also add ambient light for even illumination
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    // Optional group for future use
    this.raycastGroup = new THREE.Group();
    this.scene.add(this.raycastGroup);
  }

  addCubeAt(gpsData) {
    
    console.log("gpsData", gpsData.rotation);
    const cube = generateCameraMesh({lnglat: gpsData.lnglat, height: gpsData.height, rotation: gpsData.rotation});
    //this.scene.add(cube);
    cube.userData.gpsData = gpsData;
    this.raycastGroup.add(cube);
    // Trigger repaint on the map
    this.map.triggerRepaint?.();
  }
  cleanObject() {
	  console.log("clean object");
    this.raycastGroup.children.forEach(child => {
      this.raycastGroup.remove(child);
      child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    this.map.triggerRepaint?.();
  }
  render(matrix) {
    // Update camera projection matrix
    const cameraMatrix = originCameraMatrix(matrix, this.map.getCenter());
    this.camera.projectionMatrix = cameraMatrix;
    this.camera.updateMatrixWorld(true);

    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
    //this.composer.render();
  }

  raycast({ x, y }) {
    const { width, height } = this.map.transform;
    const camInverseProjection = this.camera.projectionMatrix.clone().invert();

    const cameraPosition = new THREE.Vector3().applyMatrix4(camInverseProjection);
    const mousePosition = new THREE.Vector3(
      (x / width) * 2 - 1, 1 - (y / height) * 2, 1,
    ).applyMatrix4(camInverseProjection);

    const viewDirection = mousePosition.sub(cameraPosition).normalize();
    this.raycaster.set(cameraPosition, viewDirection);

    const intersects = this.raycaster.intersectObjects(this.raycastGroup.children, true);
    if (intersects.length > 0)
    {
      this.clickCameraEvent(intersects[0]);
      this.selectedOutlineEvent(intersects[0]);
    }
    return intersects[0];
  }

  clickCameraEvent(intersect) {
    intersect.object.material.color.set(0x0000ff);
    console.log("intersect gpsData", intersect.object.userData.gpsData)
  }

  selectedOutlineEvent(intersect) {
    this.outlinePass.selectedObjects = [intersect.object];
    this.selectedObjects = [];
		this.selectedObjects.push( intersect.object );
  }
  // onWindowResize() {

	// 		const windowSize = this.renderer.getSize();
	// 		this.composer.setSize(windowSize.x, windowSize.y);
	// }
  dispose() {
    this.renderer.dispose();
    // Optionally traverse and dispose of materials and geometries
    // this.scene.traverse(obj => {
    //   if (obj.geometry) obj.geometry.dispose();
    //   if (obj.material) obj.material.dispose();
    // });
  }
}
