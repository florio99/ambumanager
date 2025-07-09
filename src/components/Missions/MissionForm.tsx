import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, User, Phone, AlertTriangle } from 'lucide-react';
import { Mission, Hospital, Ambulance } from '../../types';
import { useMissionStore } from '../../store/missionStore';
import AmbulanceAssignment from '../Ambulances/AmbulanceAssignment';

interface MissionFormProps {
  mission?: Mission | null;
  onSubmit: (data: Partial<Mission>) => void;
  onCancel: () => void;
}

const MissionForm: React.FC<MissionFormProps> = ({ mission, onSubmit, onCancel }) => {
  const { hospitals, ambulances, getAvailableAmbulances, assignMission } = useMissionStore();
  const availableAmbulances = getAvailableAmbulances();

  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientCondition: '',
    priority: 'normale' as Mission['priority'],
    pickupLocation: {
      address: '',
      lat: 48.8566,
      lng: 2.3522,
    },
    destination: {
      hospitalId: '',
      hospitalName: '',
      address: '',
      lat: 48.8566,
      lng: 2.3522,
    },
    notes: '',
    symptoms: [] as string[],
    estimatedDuration: 30,
  });

  const [newSymptom, setNewSymptom] = useState('');
  const [showAmbulanceAssignment, setShowAmbulanceAssignment] = useState(false);
  const [preAssignedAmbulance, setPreAssignedAmbulance] = useState<string>('');
  const [preAssignedPersonnel, setPreAssignedPersonnel] = useState<string[]>([]);

  useEffect(() => {
    if (mission) {
      setFormData({
        patientName: mission.patientName,
        patientPhone: mission.patientPhone,
        patientAge: mission.patientAge?.toString() || '',
        patientCondition: mission.patientCondition,
        priority: mission.priority,
        pickupLocation: mission.pickupLocation,
        destination: mission.destination,
        notes: mission.notes,
        symptoms: mission.symptoms,
        estimatedDuration: mission.estimatedDuration,
      });
    }
  }, [mission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: Partial<Mission> = {
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      patientAge: formData.patientAge ? parseInt(formData.patientAge) : undefined,
      patientCondition: formData.patientCondition,
      priority: formData.priority,
      status: 'en_attente',
      pickupLocation: formData.pickupLocation,
      destination: formData.destination,
      assignedPersonnel: [],
      estimatedDuration: formData.estimatedDuration,
      notes: formData.notes,
      symptoms: formData.symptoms,
      ambulanceId: preAssignedAmbulance || undefined,
      assignedPersonnel: preAssignedPersonnel,
    };

    // Si une ambulance est pré-assignée, changer le statut
    if (preAssignedAmbulance && preAssignedPersonnel.length > 0) {
      submitData.status = 'assignee';
      submitData.assignedAt = new Date();
    }

    onSubmit(submitData);
    
    // Si c'est une nouvelle mission avec pré-assignation, assigner automatiquement
    if (!mission && preAssignedAmbulance && preAssignedPersonnel.length > 0) {
      // L'assignation sera faite après la création de la mission
      setTimeout(() => {
        const missions = useMissionStore.getState().missions;
        const newMission = missions[missions.length - 1];
        if (newMission) {
          assignMission(newMission.id, preAssignedAmbulance, preAssignedPersonnel);
        }
      }, 100);
    }
  };

  const handleHospitalChange = (hospitalId: string) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (hospital) {
      setFormData({
        ...formData,
        destination: {
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          address: hospital.address,
          lat: hospital.location.lat,
          lng: hospital.location.lng,
        },
      });
    }
  };

  const addSymptom = () => {
    if (newSymptom.trim() && !formData.symptoms.includes(newSymptom.trim())) {
      setFormData({
        ...formData,
        symptoms: [...formData.symptoms, newSymptom.trim()],
      });
      setNewSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setFormData({
      ...formData,
      symptoms: formData.symptoms.filter(s => s !== symptom),
    });
  };

  const handleAmbulanceAssign = (ambulanceId: string, personnelIds: string[]) => {
    setPreAssignedAmbulance(ambulanceId);
    setPreAssignedPersonnel(personnelIds);
    setShowAmbulanceAssignment(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critique': return 'border-red-500 bg-red-50';
      case 'urgente': return 'border-orange-500 bg-orange-50';
      case 'normale': return 'border-blue-500 bg-blue-50';
      case 'faible': return 'border-gray-500 bg-gray-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {mission ? 'Modifier la mission' : 'Nouvelle mission'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations patient */}
          <div className={`p-4 rounded-lg border-2 ${getPriorityColor(formData.priority)}`}>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations du patient
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du patient *
                </label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+33123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Âge
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.patientAge}
                  onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="65"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition médicale *
                </label>
                <input
                  type="text"
                  required
                  value={formData.patientCondition}
                  onChange={(e) => setFormData({ ...formData, patientCondition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Douleur thoracique"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priorité *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Mission['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="faible">Faible</option>
                  <option value="normale">Normale</option>
                  <option value="urgente">Urgente</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Localisation
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de prise en charge *
                </label>
                <textarea
                  required
                  value={formData.pickupLocation.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    pickupLocation: { ...formData.pickupLocation, address: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="15 Rue de Rivoli, 75001 Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hôpital de destination *
                </label>
                <select
                  required
                  value={formData.destination.hospitalId}
                  onChange={(e) => handleHospitalChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Sélectionner un hôpital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name} - {hospital.address}
                    </option>
                  ))}
                </select>
                {formData.destination.hospitalId && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <strong>Lits disponibles:</strong>
                    <div className="flex space-x-4 mt-1">
                      <span className="text-red-600">Urgences: {hospitals.find(h => h.id === formData.destination.hospitalId)?.availableBeds.emergency}</span>
                      <span className="text-orange-600">Réa: {hospitals.find(h => h.id === formData.destination.hospitalId)?.availableBeds.icu}</span>
                      <span className="text-blue-600">Général: {hospitals.find(h => h.id === formData.destination.hospitalId)?.availableBeds.general}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Symptômes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptômes observés
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ajouter un symptôme"
              />
              <button
                type="button"
                onClick={addSymptom}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.symptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                >
                  {symptom}
                  <button
                    type="button"
                    onClick={() => removeSymptom(symptom)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Détails supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée estimée (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attribution des ressources
              </label>
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 rounded text-sm">
                  {availableAmbulances.length > 0 ? (
                    <span className="text-green-600">
                      {availableAmbulances.length} ambulance{availableAmbulances.length > 1 ? 's' : ''} disponible{availableAmbulances.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-red-600">Aucune ambulance disponible</span>
                  )}
                </div>
                
                {preAssignedAmbulance ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-900">Ressources pré-assignées</p>
                    <p className="text-sm text-blue-700">
                      Ambulance: {ambulances.find(a => a.id === preAssignedAmbulance)?.plateNumber}
                    </p>
                    <p className="text-sm text-blue-700">
                      Personnel: {preAssignedPersonnel.length} personne{preAssignedPersonnel.length > 1 ? 's' : ''}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPreAssignedAmbulance('');
                        setPreAssignedPersonnel([]);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      Supprimer l'assignation
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAmbulanceAssignment(true)}
                    className="w-full p-2 border border-dashed border-gray-300 rounded text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors duration-200"
                  >
                    Pré-assigner une ambulance et du personnel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes additionnelles
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Informations complémentaires..."
            />
          </div>

          {/* Alerte priorité critique */}
          {formData.priority === 'critique' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">Mission critique</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Cette mission sera traitée en priorité absolue et déclenchera des notifications immédiates.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md flex items-center space-x-2 transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              <span>{mission ? 'Modifier' : 'Créer la mission'}</span>
            </button>
          </div>
        </form>

        {/* Modal d'assignation d'ambulance */}
        {showAmbulanceAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sélectionner une ambulance et du personnel
                </h3>
                <button
                  onClick={() => setShowAmbulanceAssignment(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <AmbulanceAssignment
                  mission={{
                    ...formData,
                    id: 'temp',
                    createdAt: new Date(),
                    status: 'en_attente',
                    assignedPersonnel: [],
                  } as Mission}
                  onAssign={handleAmbulanceAssign}
                  showAvailableOnly={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionForm;