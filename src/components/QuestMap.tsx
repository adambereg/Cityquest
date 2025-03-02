import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Task } from '../types';

// Fix for Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface QuestMapProps {
  tasks: Task[];
  currentTaskIndex?: number;
  center?: [number, number];
}

// Component to update map view when center changes
const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const QuestMap: React.FC<QuestMapProps> = ({ tasks, currentTaskIndex = -1, center }) => {
  // Default center is Novosibirsk city center
  const defaultCenter: [number, number] = [55.0084, 82.9357];
  const mapCenter = center || (currentTaskIndex >= 0 && tasks[currentTaskIndex] 
    ? [tasks[currentTaskIndex].location.latitude, tasks[currentTaskIndex].location.longitude] as [number, number]
    : defaultCenter);
  
  return (
    <MapContainer 
      center={mapCenter} 
      zoom={13} 
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <ChangeView center={mapCenter} />
      
      {tasks.map((task, index) => {
        const isCurrentTask = index === currentTaskIndex;
        const isCompletedTask = index < currentTaskIndex;
        
        let markerColor = 'blue';
        if (isCurrentTask) markerColor = 'red';
        else if (isCompletedTask) markerColor = 'green';
        
        const customIcon = new L.Icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        return (
          <Marker 
            key={task.id}
            position={[task.location.latitude, task.location.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div>
                <h3 className="font-medium">{task.title}</h3>
                {isCurrentTask && <p className="text-sm text-red-600 font-medium">Текущее задание</p>}
                {isCompletedTask && <p className="text-sm text-green-600 font-medium">Выполнено</p>}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default QuestMap;