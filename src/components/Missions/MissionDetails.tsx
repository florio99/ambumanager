import React from 'react';
import { X, MapPin, Clock, User, Phone, AlertTriangle, CheckCircle, Guitar as Hospital } from 'lucide-react';
import { Mission, Ambulance, Personnel } from '../../types';
import { useMissionStore } from '../../store/missionStore';

interface MissionDetailsProps {
  mission: Mission;
  onClose: () => void;
}

const MissionDetails: React.FC<MissionDetailsProps> = ({ mission, onClose }) => {
  const { ambulances, personnel, hospitals } = useMissionStore();
  
  const assignedAmbulance = ambulances.find(a => a.id === mission.ambulanceId);
  const assignedPersonnel = personnel.filter(p => mission.assignedPersonnel.includes(p.id));
  const hospital = hospitals.find(h => h.id === mission.destination.hospitalId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'text-yellow-600 bg-yellow-100';
      case 'assignee': return 'text-blue-600 bg-blue-100';
      case 'en_cours': return 'text-green-600 bg-green-100';
      case 'terminee': return 'text-gray-600 bg-gray-100';
      case 'annulee': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critique': return 'text-red-600 bg-red-100';
      case 'urgente': return 'text-orange-600 bg-orange-100';
      case 'normale': return 'text-blue-600 bg-blue-100';
      case 'faible': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Détails de la mission #{mission.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* En-tête avec statut et priorité */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mission.status)}`}>
                {mission.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(mission.priority)}`}>
                {mission.priority}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Créée le {mission.createdAt.toLocaleDateString('fr-FR')} à {mission.createdAt.toLocaleTimeString('fr-FR')}
            </div>
          </div>

          {/* Informations patient */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Patient
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom</p>
                <p className="font-medium">{mission.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {mission.patientPhone}
                </p>
              </div>
              {mission.patientAge && (
                <div>
                  <p className="text-sm text-gray-600">Âge</p>
                  <p className="font-medium">{mission.patientAge} ans</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Condition</p>
                <p className="font-medium">{mission.patientCondition}</p>
              </div>
            </div>
            
            {mission.symptoms.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Symptômes</p>
                <div className="flex flex-wrap gap-2">
                  {mission.symptoms.map((symptom, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Localisation */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Localisation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Prise en charge</p>
                <p className="font-medium">{mission.pickupLocation.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-medium">{mission.destination.hospitalName}</p>
                <p className="text-sm text-gray-500">{mission.destination.address}</p>
              </div>
            </div>
          </div>

          {/* Ressources assignées */}
          {(assignedAmbulance || assignedPersonnel.length > 0) && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Ressources assignées
              </h4>
              
              {assignedAmbulance && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Ambulance</p>
                  <p className="font-medium">{assignedAmbulance.plateNumber} - {assignedAmbulance.model}</p>
                  <p className="text-sm text-gray-500">Carburant: {assignedAmbulance.fuelLevel}%</p>
                </div>
              )}
              
              {assignedPersonnel.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Personnel</p>
                  <div className="space-y-2">
                    {assignedPersonnel.map((person) => (
                      <div key={person.id} className="flex items-center justify-between">
                        <span className="font-medium">{person.firstName} {person.lastName}</span>
                        <span className="text-sm text-gray-500 capitalize">{person.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chronologie */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Chronologie
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mission créée</span>
                <span className="font-medium">{mission.createdAt.toLocaleString('fr-FR')}</span>
              </div>
              
              {mission.assignedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assignée</span>
                  <span className="font-medium">{mission.assignedAt.toLocaleString('fr-FR')}</span>
                </div>
              )}
              
              {mission.startedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Démarrée</span>
                  <span className="font-medium">{mission.startedAt.toLocaleString('fr-FR')}</span>
                </div>
              )}
              
              {mission.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Terminée</span>
                  <span className="font-medium">{mission.completedAt.toLocaleString('fr-FR')}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-gray-600">Durée estimée</span>
                <span className="font-medium">{formatDuration(mission.estimatedDuration)}</span>
              </div>
              
              {mission.actualDuration && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Durée réelle</span>
                  <span className="font-medium">{formatDuration(mission.actualDuration)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {mission.notes && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-gray-700">{mission.notes}</p>
            </div>
          )}

          {/* Informations hôpital */}
          {hospital && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Hôpital de destination</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-medium">{hospital.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{hospital.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-2">Lits disponibles</p>
                  <div className="flex space-x-4">
                    <span className="text-red-600">Urgences: {hospital.availableBeds.emergency}</span>
                    <span className="text-orange-600">Réanimation: {hospital.availableBeds.icu}</span>
                    <span className="text-blue-600">Général: {hospital.availableBeds.general}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionDetails;