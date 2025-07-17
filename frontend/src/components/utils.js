import maplibregl from 'maplibre-gl';
import * as THREE from 'three';

//120.6325982 24.04898052
export const originLngLat = { lng: 120.6325982, lat: 24.04898052, alt: 0 };

// parameters to ensure the model is georeferenced correctly on the map
const OriginLntLat_array = [120.6325982, 24.04898052];
const originAltitude = 0;
const originRotate = [Math.PI / 2, 0, 0];
const originMerc = maplibregl.MercatorCoordinate.fromLngLat(
    OriginLntLat_array,
    originAltitude
);
export const originTransform = {
    translateX: originMerc.x,
    translateY: originMerc.y,
    translateZ: originMerc.z,
    rotateX: originRotate[0],
    rotateY: originRotate[1],
    rotateZ: originRotate[2],
    scale: originMerc.meterInMercatorCoordinateUnits()
};

export function originCameraMatrix(matrix)
{
    const rotationX = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(1, 0, 0),
        originTransform.rotateX
      );
      const rotationY = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 1, 0),
        originTransform.rotateY
      );
      const rotationZ = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 0, 1),
        originTransform.rotateZ
      );
    
      const m = new THREE.Matrix4().fromArray(matrix.defaultProjectionData.mainMatrix);
      const l = new THREE.Matrix4()
        .makeTranslation(
          originTransform.translateX,
          originTransform.translateY,
          originTransform.translateZ
        )
        .scale(
          new THREE.Vector3(
            originTransform.scale,
            -originTransform.scale,
            originTransform.scale
          )
        )
        .multiply(rotationX)
        .multiply(rotationY)
        .multiply(rotationZ);
    return m.multiply(l);
}

export function lngLatAltToLocalMeters(lng, lat, maplng, maplat, alt=0) {
    const R = 6378137; // Earth radius in meters (WGS84)

    const dLng = THREE.MathUtils.degToRad(lng - maplng);
    const dLat = THREE.MathUtils.degToRad(lat - maplat);

    const x = dLng * R * Math.cos(THREE.MathUtils.degToRad(maplat));
    const y = dLat * R;
    const z = alt - originLngLat.alt;

    return new THREE.Vector3(x, y, z);
}

