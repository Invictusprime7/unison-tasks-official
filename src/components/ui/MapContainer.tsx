import React, { useEffect, useRef, useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Global type declaration for window.L
declare global {
  interface Window {
    L?: typeof L;
  }
}

// Fix default marker icons in React Leaflet
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: () => string;
}

delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export interface MapMarker {
  position: [number, number];
  title?: string;
  popup?: string;
  color?: string;
}

export interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  style?: React.CSSProperties;
  className?: string;
  height?: number | string;
  width?: number | string;
  showScale?: boolean;
  showZoomControl?: boolean;
  fitToMarkers?: boolean;
  onClick?: (lat: number, lng: number) => void;
}

const MapClickHandler: React.FC<{ onClick?: (lat: number, lng: number) => void }> = ({ onClick }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!onClick) return;
    
    const handleClick = (e: L.LeafletMouseEvent) => {
      onClick(e.latlng.lat, e.latlng.lng);
    };
    
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onClick]);
  
  return null;
};

const FitBounds: React.FC<{ markers: MapMarker[]; fitToMarkers: boolean }> = ({ markers, fitToMarkers }) => {
  const map = useMap();
  
  useEffect(() => {
    if (fitToMarkers && markers.length > 1) {
      const bounds = L.latLngBounds(markers.map(m => m.position));
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [map, markers, fitToMarkers]);
  
  return null;
};

export const MapContainer: React.FC<MapContainerProps> = ({
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 12,
  markers = [],
  style,
  className = '',
  height = 400,
  width = '100%',
  showScale = true,
  showZoomControl = true,
  fitToMarkers = true,
  onClick
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  
  useEffect(() => {
    const checkLeaflet = () => {
      if (typeof window !== 'undefined' && window.L) {
        setLeafletReady(true);
        setHasMounted(true);
      } else {
        // Check again after a short delay
        setTimeout(checkLeaflet, 100);
      }
    };
    
    checkLeaflet();
  }, []);
  
  if (!hasMounted || !leafletReady) {
    return (
      <div 
        style={{ height, width, ...style }}
        className={`flex items-center justify-center bg-slate-100 rounded-lg ${className}`}
      >
        <div className="text-slate-500">Loading interactive map service...</div>
      </div>
    );
  }
  
  // Additional safety check
  if (!L || !L.Map) {
    return (
      <div 
        style={{ height, width, ...style }}
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
      >
        <div className="text-red-600 text-center p-4">
          <div className="font-medium">Interactive map service not available</div>
          <div className="text-sm mt-1">An external script might be missing.</div>
        </div>
      </div>
    );
  }
  
  const containerStyle: React.CSSProperties = {
    height,
    width,
    ...style
  };
  
  return (
    <div style={containerStyle} className={className}>
      <LeafletMapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={showZoomControl}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            {marker.popup && (
              <Popup>
                <div>
                  {marker.title && <strong>{marker.title}</strong>}
                  {marker.title && marker.popup && <br />}
                  {marker.popup}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
        
        <MapClickHandler onClick={onClick} />
        <FitBounds markers={markers} fitToMarkers={fitToMarkers} />
        
        {showScale && (
          <div className="leaflet-control-container">
            {/* Scale control is added automatically by Leaflet */}
          </div>
        )}
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;