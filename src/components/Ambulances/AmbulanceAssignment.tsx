import React, { useState } from 'react';
import { Truck, Users, MapPin, Clock, CheckCircle, AlertTriangle, User, Phone } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { Ambulance, Personnel, Mission } from '../../types';
import toast from 'react-hot-toast';

interface AmbulanceAssignmentProps {
  mission?: Mission;
  onAssign?: (ambulanceId: string, personnelIds: string[]) => void;
  showAvailableOnly?: boolean;
}

const AmbulanceAssignment: React.FC<AmbulanceAssignmentProps> = ({ 
  mission, 
  onAssign, 
  showAvailableOnly = false 
}) => {
  const { ambulances, personnel, assignMission } = useMissionStore();
  const [selectedAmbulance, setSelectedAmbulance] = useState<string>('');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);

  // Filtrer les ambulances selon les critères
  const filteredAmbulances = ambulances.filter(ambulance => {
    if (showAvailableOnly) {
      return ambulance.status === 'disponible';
    }
    return true;
  });

  // Obtenir le personnel disponible pour une ambulance
  const getAvailablePersonnelForAmbulance = (ambulanceId: string) => {
    const ambulance = ambulances.find(a => a.id === ambulanceId);
    if (!ambulance) return [];

    return personnel.filter(person => {
      // Personnel déjà assigné à cette ambulance
      if (ambulance.assignedPersonnel.includes(person.id)) return true;
      
      // Personnel disponible et non assigné ailleurs
      return person.status === 'disponible' || person.status === 'en_service';
    });
  };

  // Calculer la distance approximative (simulation)
  const calculateDistance = (ambulance: Ambulance, mission?: Mission) => {
    if (!mission) return 0;
    
    const lat1 = ambulance.location.lat;
    const lng1 = ambulance.location.lng;
    const lat2 = mission.pickupLocation.lat;
    const lng2 = mission.pickupLocation.lng;
    
    // Formule de distance approximative
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Arrondir à 1 décimale
  };

  // Calculer le temps d'arrivée estimé
  const calculateETA = (distance: number) => {
    const averageSpeed = 40; // km/h en ville
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    return timeInMinutes;
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'text-green-600 bg-green-100';
      case 'en_mission': return 'text-blue-600 bg-blue-100';
      case 'en_panne': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Obtenir la couleur du niveau de carburant
  const getFuelColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Gérer la sélection d'ambulance
  const handleAmbulanceSelect = (ambulanceId: string) => {
    setSelectedAmbulance(ambulanceId);
    setSelectedPersonnel([]);
  };

  // Gérer la sélection de personnel
  const handlePersonnelToggle = (personnelId: string) => {
    setSelectedPersonnel(prev => {
      if (prev.includes(personnelId)) {
        return prev.filter(id => id !== personnelId);
      } else {
        const ambulance = ambulances.find(a => a.id === selectedAmbulance);
        if (ambulance && prev.length < ambulance.capacity + 1) {
          return [...prev, personnelId];
        }
        return prev;
      }
    });
  };

  // Assigner la mission
  const handleAssign = () => {
    if (!selectedAmbulance || selectedPersonnel.length === 0) {
      toast.error('Veuillez sélectionner une ambulance et du personnel');
      return;
    }

    if (mission) {
      assignMission(mission.id, selectedAmbulance, selectedPersonnel);
    }

    if (onAssign) {
      onAssign(selectedAmbulance, selectedPersonnel);
    }

    // Reset
    setSelectedAmbulance('');
    setSelectedPersonnel([]);
  };

  // Trier les ambulances par pertinence
  const sortedAmbulances = [...filteredAmbulances].sort((a, b) => {
    if (!mission) return 0;
    
    // Priorité aux ambulances disponibles
    if (a.status === 'disponible' && b.status !== 'disponible') return -1;
    if (b.status === 'disponible' && a.status !== 'disponible') return 1;
    
    // Puis par distance
    const distanceA = calculateDistance(a, mission);
    const distanceB = calculateDistance(b, mission);
    return distanceA - distanceB;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Ambulances et Personnel Disponibles
        </h3>
        {mission && (
          <div className="text-sm text-gray-500">
            Mission: {mission.patientName} - {mission.priority}
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">Disponibles</p>
              <p className="text-lg font-bold text-green-700">
                {ambulances.filter(a => a.status === 'disponible').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Truck className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600">En mission</p>
              <p className="text-lg font-bold text-blue-700">
                {ambulances.filter(a => a.status === 'en_mission').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm text-yellow-600">Maintenance</p>
              <p className="text-lg font-bold text-yellow-700">
                {ambulances.filter(a => a.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-purple-600">Personnel actif</p>
              <p className="text-lg font-bold text-purple-700">
                {personnel.filter(p => p.status === 'en_service').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des ambulances */}
      <div className="space-y-4">
        {sortedAmbulances.map((ambulance) => {
          const availablePersonnel = getAvailablePersonnelForAmbulance(ambulance.id);
          const distance = mission ? calculateDistance(ambulance, mission) : 0;
          const eta = calculateETA(distance);
          const isSelected = selectedAmbulance === ambulance.id;

          return (
            <div
              key={ambulance.id}
              className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'border-primary-500 bg-primary-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => handleAmbulanceSelect(ambulance.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Informations ambulance */}
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {ambulance.plateNumber}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ambulance.status)}`}>
                          {ambulance.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{ambulance.model}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>Capacité: {ambulance.capacity} patients</span>
                        <span className={getFuelColor(ambulance.fuelLevel)}>
                          Carburant: {ambulance.fuelLevel}%
                        </span>
                        <span>{ambulance.mileage.toLocaleString()} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Distance et ETA */}
                  {mission && (
                    <div className="flex items-center space-x-4 mb-3 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        Distance: {distance} km
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        ETA: {eta} min
                      </div>
                    </div>
                  )}

                  {/* Personnel disponible */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Personnel disponible ({availablePersonnel.length})
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {availablePersonnel.map((person) => {
                        const isPersonSelected = selectedPersonnel.includes(person.id);
                        const isAlreadyAssigned = ambulance.assignedPersonnel.includes(person.id);
                        
                        return (
                          <div
                            key={person.id}
                            className={`p-2 rounded border text-sm cursor-pointer transition-colors duration-200 ${
                              isPersonSelected
                                ? 'border-primary-500 bg-primary-100'
                                : isAlreadyAssigned
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            } ${!isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelected && !isAlreadyAssigned) {
                                handlePersonnelToggle(person.id);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {person.firstName} {person.lastName}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {person.role}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1">
                                {isAlreadyAssigned && (
                                  <span className="text-xs text-blue-600">Assigné</span>
                                )}
                                {isPersonSelected && (
                                  <CheckCircle className="h-4 w-4 text-primary-600" />
                                )}
                                <User className="h-3 w-3 text-gray-400" />
                              </div>
                            </div>
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {person.phone}
                            </div>
                            {person.qualification.length > 0 && (
                              <div className="mt-1">
                                <div className="flex flex-wrap gap-1">
                                  {person.qualification.slice(0, 2).map((qual, index) => (
                                    <span key={index} className="text-xs bg-gray-200 text-gray-700 px-1 rounded">
                                      {qual}
                                    </span>
                                  ))}
                                  {person.qualification.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{person.qualification.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recommandation */}
                {mission && ambulance.status === 'disponible' && distance < 5 && (
                  <div className="ml-4">
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-green-700 font-medium">Recommandé</p>
                      <p className="text-xs text-green-600">Proche et disponible</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Équipements */}
              {ambulance.equipment.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Équipements:</p>
                  <div className="flex flex-wrap gap-1">
                    {ambulance.equipment.slice(0, 4).map((equipment, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {equipment}
                      </span>
                    ))}
                    {ambulance.equipment.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{ambulance.equipment.length - 4} autres
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bouton d'assignation */}
      {mission && selectedAmbulance && selectedPersonnel.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sticky bottom-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                Ambulance: {ambulances.find(a => a.id === selectedAmbulance)?.plateNumber}
              </p>
              <p className="text-sm text-gray-600">
                Personnel sélectionné: {selectedPersonnel.length} personne{selectedPersonnel.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={handleAssign}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Assigner la mission
            </button>
          </div>
        </div>
      )}

      {/* Message si aucune ambulance disponible */}
      {filteredAmbulances.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune ambulance {showAvailableOnly ? 'disponible' : 'trouvée'}
          </h3>
          <p className="text-gray-500">
            {showAvailableOnly 
              ? 'Toutes les ambulances sont actuellement en mission ou en maintenance.'
              : 'Aucune ambulance ne correspond aux critères de recherche.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AmbulanceAssignment;