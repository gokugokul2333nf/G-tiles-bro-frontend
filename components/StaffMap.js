import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map centering/zooming
function MapController({ center }) {
  const map = useMap();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (center) {
      if (firstLoad.current) {
        map.setView(center, 15); // Zoom in close for "delivery partner" feel on first load
        firstLoad.current = false;
      } else {
        map.panTo(center, { animate: true, duration: 1.0 });
      }
    }
  }, [center, map]);

  return null;
}

export default function StaffMap({ staffLocations, centerPosition, isDark }) {
  // Use a key that changes if the initial center is radically different (e.g. first load)
  // to help react-leaflet stay in sync, but mostly to avoid "already initialized"
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        key="main-staff-map" // Static key to help React identify it
        center={centerPosition} 
        zoom={13} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={isDark 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapController center={centerPosition} />

        {staffLocations.map((staff) => (
          staff.location && staff.location.latitude && (
            <Marker 
              key={staff._id} 
              position={[staff.location.latitude, staff.location.longitude]}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <p className="font-bold text-slate-900 border-b pb-1 mb-1">{staff.name}</p>
                  <p className="text-[10px] text-slate-500">{staff.email}</p>
                  <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    LIVE NOW
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
