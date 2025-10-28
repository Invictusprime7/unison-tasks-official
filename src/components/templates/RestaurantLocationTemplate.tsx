import React from 'react';
import LocationMap from '../ui/LocationMap';

interface RestaurantLocationProps {
  restaurantName?: string;
  address?: string;
  phone?: string;
  hours?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

const RestaurantLocationTemplate: React.FC<RestaurantLocationProps> = ({
  restaurantName = "Bella Vista Restaurant",
  address = "123 Main Street, New York, NY 10001",
  phone = "(555) 123-4567",
  hours = "Mon-Sun 11am-10pm",
  location = { lat: 40.7505, lng: -73.9934 }
}) => {
  const restaurantLocation = [
    {
      name: restaurantName,
      lat: location.lat,
      lng: location.lng,
      description: `${restaurantName} - ${address}`,
      color: '#dc2626'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Visit Our Restaurant
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Located in the heart of the city, we're easy to find and always ready to serve you delicious food.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Restaurant Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600">{address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">{phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Hours</h4>
                    <p className="text-gray-600">{hours}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Getting Here</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span>Street parking available</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span>5 min walk from Metro Station</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span>Wheelchair accessible entrance</span>
                </li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button 
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                onClick={() => window.open(`tel:${phone}`, '_self')}
              >
                Call Now
              </button>
              <button 
                className="flex-1 border border-red-600 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank')}
              >
                Get Directions
              </button>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="space-y-4">
            <LocationMap
              locations={restaurantLocation}
              center={[location.lat, location.lng]}
              zoom={16}
              height={400}
              className="shadow-lg"
              onLocationClick={(lat, lng) => {
                const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
                window.open(googleMapsUrl, '_blank');
              }}
            />
            <p className="text-sm text-gray-500 text-center">
              Click on the map to open in Google Maps
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-red-50 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Can't Find Us?
            </h3>
            <p className="text-gray-600 mb-4">
              We're located on the ground floor of the historic Morrison Building. 
              Look for our red awning and outdoor seating area.
            </p>
            <p className="text-sm text-gray-500">
              For large groups or special events, please call ahead for reservations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantLocationTemplate;