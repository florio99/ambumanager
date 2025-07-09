import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Ambulance } from '../../types';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AmbulanceMapProps {
  ambulances: Ambulance[];
}

const AmbulanceMap: React.FC<AmbulanceMapProps> = ({ ambulances }) => {
  const mapRef = useRef<L.Map>(null);

  // Créer des icônes personnalisées selon le statut
  const createIcon = (status: string) => {
    const color = status === 'disponible' ? 'green' : 
                  status === 'en_mission' ? 'blue' : 
                  status === 'en_panne' ? 'red' : 'orange';
    
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-ambulance-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'en_mission': return 'En mission';
      case 'en_panne': return 'En panne';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  // Centre de Paris par défaut
  const defaultCenter: [number, number] = [48.8566, 2.3522];

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {ambulances.map((ambulance) => (
          <Marker
            key={ambulance.id}
            position={[ambulance.location.lat, ambulance.location.lng]}
            icon={createIcon(ambulance.status)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">{ambulance.plateNumber}</h3>
                <p className="text-sm text-gray-600">{ambulance.model}</p>
                <p className="text-sm">
                  <span className="font-medium">Statut:</span> {getStatusText(ambulance.status)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Carburant:</span> {ambulance.fuelLevel}%
                </p>
                <p className="text-sm">
                  <span className="font-medium">Personnel:</span> {ambulance.assignedPersonnel.length}/{ambulance.capacity + 1}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Dernière mise à jour: {ambulance.location.lastUpdate.toLocaleTimeString('fr-FR')}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AmbulanceMap;