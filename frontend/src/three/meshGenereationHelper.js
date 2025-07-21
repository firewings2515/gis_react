import * as THREE from 'three';
import maplibregl from 'maplibre-gl';
import { originTransform } from '../utils/utils';

export function generateCameraMesh({
  lnglat,
  height,
  rotation,
  fov = 60,
  aspect = 1.0,        // width / height
  color = 0xff0000,    // mesh color
  opacity = 1
}) {
  // Calculate frustum base size at given length
  let lng, lat;
  [lng, lat] = lnglat;
  const merc = maplibregl.MercatorCoordinate.fromLngLat([lng, lat], height);
  const scale = 10;
  const length = 5 * scale;

  const localX = (merc.x - originTransform.translateX) / originTransform.scale;
  const localY = (merc.y - originTransform.translateY) / originTransform.scale;
  const localZ = (merc.z - originTransform.translateZ) / originTransform.scale;
  const position = new THREE.Vector3(localX, localZ, localY);


  let yaw, pitch, roll;
  [yaw, pitch, roll] = rotation;

  const yawRad = THREE.MathUtils.degToRad(yaw);
  const pitchRad = THREE.MathUtils.degToRad(pitch);
  const rollRad = THREE.MathUtils.degToRad(roll);

  const fovRad = THREE.MathUtils.degToRad(fov);
  const halfHeight = Math.tan(fovRad / 2) * length;
  const halfWidth = halfHeight * aspect;

  // Vertices: apex at origin, base at distance "length"
  const apex = new THREE.Vector3(0, 0, 0);
  const base1 = new THREE.Vector3(-halfWidth, -halfHeight, -length);
  const base2 = new THREE.Vector3(halfWidth, -halfHeight, -length);
  const base3 = new THREE.Vector3(halfWidth, halfHeight, -length);
  const base4 = new THREE.Vector3(-halfWidth, halfHeight, -length);

  // Geometry
  const geometry = new THREE.BufferGeometry().setFromPoints([
    apex, base1, base2,   // Side 1
    apex, base2, base3,   // Side 2
    apex, base3, base4,   // Side 3
    apex, base4, base1,   // Side 4
    base1, base2, base3,  // Base triangle 1
    base1, base3, base4   // Base triangle 2
  ]);
  const indices = [
     0,  1,  2, // side 1
     3,  4,  5, // side 2
     6,  7,  8, // side 3
     9, 10, 11, // side 4
    12, 13, 14, // base 1
    15, 16, 17  // base 2
  ];
  geometry.setIndex(indices);
  // Material
  const material = new THREE.MeshStandardMaterial({
    color,
    opacity,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Rotation: yaw (Y), pitch (X), roll (Z)
  mesh.rotation.order = "YXZ";
  mesh.rotation.y = yawRad;
  mesh.rotation.x = pitchRad;
  mesh.rotation.z = rollRad;

  // Move to world position
  mesh.position.copy(position);

  return mesh;
}