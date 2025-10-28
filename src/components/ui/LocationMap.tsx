import React from 'react';
import MapContainer, { MapMarker } from './MapContainer';

export interface LocationMapProps {
  locations?: Array<{
    name: string;
    lat: number;
    lng: number;
    description?: string;
    color?: string;
  }>;
  center?: [number, number];
  zoom?: number;
  height?: number | string;
  width?: number | string;
  className?: string;
  title?: string;
  onLocationClick?: (lat: number, lng: number) => void;
}

// Popular city locations for demos
const DEMO_LOCATIONS = [
  { name: 'New York', lat: 40.7128, lng: -74.0060, description: 'The Big Apple' },
  { name: 'London', lat: 51.5074, lng: -0.1278, description: 'Historic Capital' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, description: 'Modern Metropolis' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, description: 'City of Light' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, description: 'Harbor City' },
];

const LocationMap: React.FC<LocationMapProps> = ({
  locations = DEMO_LOCATIONS,
  center,
  zoom = 3,
  height = 400,
  width = '100%',
  className = '',
  title,
  onLocationClick
}) => {
  // Convert locations to map markers
  const markers: MapMarker[] = locations.map(location => ({
    position: [location.lat, location.lng] as [number, number],
    title: location.name,
    popup: location.description || location.name,
    color: location.color
  }));

  // Auto-calculate center if not provided
  const mapCenter = center || (locations.length > 0 
    ? [locations[0].lat, locations[0].lng] as [number, number]
    : [40.7128, -74.0060] as [number, number]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      )}
      <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          markers={markers}
          height={height}
          width={width}
          onClick={onLocationClick}
          fitToMarkers={locations.length > 1}
        />
      </div>
      {locations.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Showing {locations.length} location{locations.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default LocationMap;