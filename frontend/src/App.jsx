import { useRef, useState } from 'react';
import MapView from './components/MapView';
import ThreeScene from './components/ThreeScene';
import axios from 'axios';
import GPSData from './data/GPSData';
import GpsPropertyPanel from './components/GpsPropertyPanel';
import ExpandableHamburgerMenu from './components/ExpandableHamburgerMenu';
import GpsImagePanel from "./components/GpsImagePanel";

// Define the menu structure
const menu = [
  {
    label: "底圖",
    children: [
      { label: "ArcGIS", action: "basemap-arcgis" },
      { label: "Google Satellite", action: "basemap-google" },
      { label: "OpenStreetMap", action: "basemap-osm" }
    ]
  },
  {
    label: "空拍案",
    children: [
      {label: "113年空拍", children: [
        {label: "空拍07月", action: "114-1"},
        {label: "空拍07月試飛", action: "try"}
      ]},
    ]
  },
  { label: "Settings", action: "settings" },
  { label: "Help", action: "help" }
];


function App() {
  const mapRef = useRef();
  const threeRef = useRef();
  const [selectedGpsData, setSelectedGpsData] = useState(null);

  const fetchAndRenderGPS = async () => {
    try {
      console.log("fetching gps data...");
      const res = await axios.get('http://localhost:8080/get_gps');
      const gpsjson = res.data.gpsData;
      const first = gpsjson[0];
      //threeRef.current?.addCubeAt(first.lng, first.lat, first.height);
      gpsjson.forEach(point => {
        threeRef.current?.addCubeAt(new GPSData(point));
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
      <ThreeScene mapRef={mapRef} 
      ref={threeRef} 
      onMeshClick={setSelectedGpsData}
      />
      {/* Property Window */}
      <GpsPropertyPanel 
        data={selectedGpsData} 
        onClose={() => setSelectedGpsData(null)} 
      />
      <GpsImagePanel
        imageName={selectedGpsData?.imageName}
        onClose={() => setSelectedGpsData(null)}
      />
      {/* <HamburgerMenu
        options={["Home", "Import GPS", "Settings", "Help"]}
        onSelect={option => {
          // handle selection (switch view, show modal, etc)
          alert("Selected: " + option);
        }}
      /> */}
      <ExpandableHamburgerMenu
        menu={menu}
        onAction={(action, label) => {
          // handle action here
          console.log("label", label, "action", action);
          if (action === "114-1")
          {fetchAndRenderGPS();}
          //alert(`Clicked: ${label} (${action})`);
        }}
      />
    </div>
  );
}

export default App;
