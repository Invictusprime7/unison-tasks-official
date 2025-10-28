import React, { useState } from 'react';
import LocationMap from '../components/ui/LocationMap';
import MapContainer from '../components/ui/MapContainer';

const MapTestPage: React.FC = () => {
  const [clickedLocation, setClickedLocation] = useState<{lat: number, lng: number} | null>(null);

  const officeLocations = [
    { name: 'New York HQ', lat: 40.7128, lng: -74.0060, description: 'Main headquarters in Manhattan' },
    { name: 'London Office', lat: 51.5074, lng: -0.1278, description: 'European operations center' },
    { name: 'Tokyo Branch', lat: 35.6762, lng: 139.6503, description: 'Asia-Pacific hub' },
  ];

  const restaurantLocations = [
    { name: "Joe's Pizza", lat: 40.7505, lng: -73.9934, description: 'Best pizza in NYC' },
    { name: 'Central Park Cafe', lat: 40.7829, lng: -73.9654, description: 'Coffee with a view' },
    { name: 'Brooklyn Brewery', lat: 40.7210, lng: -73.9570, description: 'Local craft beer' },
  ];

  const handleMapClick = (lat: number, lng: number) => {
    setClickedLocation({ lat, lng });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Map Component Testing</h1>
        
        <div className="space-y-12">
          {/* Basic Map */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Basic Interactive Map</h2>
            <p className="text-gray-600 mb-4">Click anywhere on the map to see coordinates:</p>
            <div className="bg-white p-6 rounded-lg shadow">
              <MapContainer
                center={[40.7128, -74.0060]}
                zoom={12}
                height={300}
                onClick={handleMapClick}
                markers={[
                  {
                    position: [40.7128, -74.0060],
                    title: 'New York City',
                    popup: 'Welcome to NYC!'
                  }
                ]}
              />
              {clickedLocation && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Clicked location:</strong> {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Office Locations */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Office Locations</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <LocationMap
                title="Our Global Offices"
                locations={officeLocations}
                height={400}
                zoom={2}
                onLocationClick={handleMapClick}
              />
            </div>
          </section>

          {/* Restaurant Locations (NYC focused) */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">NYC Restaurant Guide</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <LocationMap
                title="Recommended Restaurants"
                locations={restaurantLocations}
                center={[40.7489, -73.9680]}
                height={350}
                zoom={12}
                onLocationClick={handleMapClick}
              />
            </div>
          </section>

          {/* World Map */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">World Map</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <LocationMap
                title="Popular Destinations Worldwide"
                height={450}
                zoom={2}
                onLocationClick={handleMapClick}
              />
            </div>
          </section>

          {/* Small Compact Map */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Compact Map</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Find Us Here</h3>
                  <MapContainer
                    center={[40.7505, -73.9934]}
                    zoom={15}
                    height={200}
                    markers={[
                      {
                        position: [40.7505, -73.9934],
                        title: "Joe's Pizza",
                        popup: 'Best pizza in the neighborhood!'
                      }
                    ]}
                  />
                </div>
                <div className="flex items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Visit Our Store</h3>
                    <p className="text-gray-600 mb-2">📍 123 Main Street, New York, NY 10001</p>
                    <p className="text-gray-600 mb-2">📞 (555) 123-4567</p>
                    <p className="text-gray-600">⏰ Open Mon-Fri 9am-6pm</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p>Maps powered by React Leaflet and OpenStreetMap</p>
        </div>
      </div>
    </div>
  );
};

export default MapTestPage;