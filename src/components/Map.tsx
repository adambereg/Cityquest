import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Фиксим проблему с иконками Leaflet в React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    description?: string;
  }>;
  onLocationFound?: (location: [number, number]) => void;
}

// Компонент для отслеживания местоположения пользователя
const LocationMarker = ({ onLocationFound }: { onLocationFound?: (location: [number, number]) => void }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ watch: true });

    map.on('locationfound', (e) => {
      const coords: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(coords);
      if (onLocationFound) {
        onLocationFound(coords);
      }
    });

    return () => {
      map.stopLocate();
      map.off('locationfound');
    };
  }, [map, onLocationFound]);

  return position ? (
    <Marker position={position}>
      <Popup>Вы находитесь здесь</Popup>
    </Marker>
  ) : null;
};

export const Map = ({ center, zoom = 13, markers = [], onLocationFound }: MapProps) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          <Popup>
            <div>
              <h3 className="font-semibold">{marker.title}</h3>
              {marker.description && (
                <p className="text-sm text-gray-600">{marker.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      <LocationMarker onLocationFound={onLocationFound} />
    </MapContainer>
  );
}; 