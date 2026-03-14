import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

// Fix Leaflet icon issue for Next.js
if (typeof window !== 'undefined' && L.Icon) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// Function to create dynamic staff icon with avatar/initials
// Function to create beautiful salesperson icon
const createStaffIcon = (staff, isStale) => {
  if (typeof window === 'undefined' || !L) return null;

  try {
    const avatarUrl = staff.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(staff.name || 'Sales')}&clothing=suitAndTie&eyebrows=default&mouth=smile&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    
    return L.divIcon({
      className: `custom-staff-icon ${isStale ? 'stale' : ''}`,
      html: `
        <div class="marker-container ${isStale ? 'stale' : ''}">
          ${!isStale ? '<div class="marker-pulse"></div>' : ''}
          <div class="sales-avatar-wrapper">
            <img src="${avatarUrl}" alt="${staff.name}" class="sales-avatar-img" />
            ${isStale ? '<div class="offline-overlay">OFFLINE</div>' : ''}
          </div>
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    });
  } catch (err) {
    console.error('Failed to create icon', err);
    return null;
  }
};

// Component to handle map centering/zooming
function MapController({ center }) {
  const map = useMap();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (!center || !Array.isArray(center) || center.length < 2) return;
    
    const [lat, lng] = center;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    try {
      if (firstLoad.current) {
        map.setView(center, 15);
        firstLoad.current = false;
      } else {
        map.panTo(center, { animate: true, duration: 1.0 });
      }
    } catch (err) {
      console.error('Map animation error:', err);
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

        {staffLocations.map((staff) => {
          const lat = staff.location?.latitude;
          const lng = staff.location?.longitude;
          const hasValidLoc = typeof lat === 'number' && typeof lng === 'number';
          
          if (!hasValidLoc) return null;

          const lastUpdate = staff.location?.lastLocationUpdate;
          const isStale = !lastUpdate || (Date.now() - new Date(lastUpdate).getTime() > 60000);

          return (
            <Marker 
              key={staff._id || staff.email} 
              position={[lat, lng]}
              icon={createStaffIcon(staff, isStale)}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <p className="font-bold text-slate-900 border-b pb-1 mb-1">{staff.name}</p>
                  <p className="text-[10px] text-slate-500">{staff.email}</p>
                  {isStale ? (
                    <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1 italic">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                      OFFLINE / STALE
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      LIVE NOW
                    </p>
                  )}
                  <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold">
                    Last Seen: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Unknown'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style jsx global>{`
        /* Smoothly animate marker movement */
        .leaflet-marker-icon,
        .leaflet-marker-shadow {
          transition: transform 1.0s linear !important;
        }

        .marker-container {
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sales-avatar-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          background: white;
          overflow: hidden;
          position: relative;
          z-index: 2;
        }

        .sales-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .offline-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          color: white;
          font-size: 7px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.5px;
        }

        .marker-pulse {
          position: absolute;
          width: 50px;
          height: 50px;
          background: rgba(79, 70, 229, 0.4);
          border-radius: 50%;
          animation: marker-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          z-index: 1;
        }

        @keyframes marker-ping {
          75%, 100% {
            transform: scale(2.0);
            opacity: 0;
          }
        }
        
        .leaflet-container {
          background: #0f172a !important;
        }
      `}</style>
    </div>
  );
}
