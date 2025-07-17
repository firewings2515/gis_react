import { useRef } from 'react';
import MapView from './components/MapView';
import ThreeScene from './components/ThreeScene';
import ThreeOnlyScene from './components/ThreeScene';
import axios from 'axios';

function App() {
  const mapRef = useRef();
  const threeRef = useRef();
  
  const fetchAndRenderGPS = async () => {
    try {
      const res = await axios.get('http://localhost:8080/get_gps');
      const gpsData = res.data.gpsData;
      const first = gpsData[0];
      //threeRef.current?.addCubeAt(first.lng, first.lat, first.height);
      gpsData.forEach(point => {
        threeRef.current?.addCubeAt(point.lng, point.lat, point.height);
      });
      //threeRef.current?.addCubeAt(120.6326947595254, 24.04887274695568, 10);
      // if (gpsData.length > 0) {
      //   const first = gpsData[0];
      //   threeRef.current?.moveCameraTo(first.lng, first.lat, first.height);
      // }
    } catch (err) {
      console.error('Error loading GPS:', err);
    }
  };
  
  return (
    <div className="w-screen h-screen relative">
      <MapView ref={mapRef} onKeyPress={(key) => {
        if (key === 'a') fetchAndRenderGPS();
        if (key === 'd') { threeRef.current?.addRayDebug(); }
      }} />
      <ThreeScene mapRef={mapRef} ref={threeRef} />
    </div>
  );
}

export default App;
