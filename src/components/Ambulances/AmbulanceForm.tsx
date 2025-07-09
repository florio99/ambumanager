import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Ambulance } from '../../types';

interface AmbulanceFormProps {
  ambulance?: Ambulance | null;
  onSubmit: (data: Partial<Ambulance>) => void;
  onCancel: () => void;
}

const AmbulanceForm: React.FC<AmbulanceFormProps> = ({ ambulance, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    model: '',
    capacity: 2,
    status: 'disponible' as Ambulance['status'],
    fuelLevel: 100,
    mileage: 0,
    equipment: [] as string[],
  });

  const [newEquipment, setNewEquipment] = useState('');

  useEffect(() => {
    if (ambulance) {
      setFormData({
        plateNumber: ambulance.plateNumber,
        model: ambulance.model,
        capacity: ambulance.capacity,
        status: ambulance.status,
        fuelLevel: ambulance.fuelLevel,
        mileage: ambulance.mileage,
        equipment: ambulance.equipment,
      });
    }
  }, [ambulance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: Partial<Ambulance> = {
      ...formData,
    };

    if (!ambulance) {
      // Nouvelles données pour une nouvelle ambulance
      submitData.location = {
        lat: 48.8566 + (Math.random() - 0.5) * 0.1,
        lng: 2.3522 + (Math.random() - 0.5) * 0.1,
        lastUpdate: new Date(),
      };
      submitData.assignedPersonnel = [];
    }

    onSubmit(submitData);
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !formData.equipment.includes(newEquipment.trim())) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, newEquipment.trim()],
      });
      setNewEquipment('');
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter(e => e !== equipment),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {ambulance ? 'Modifier l\'ambulance' : 'Nouvelle ambulance'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de plaque *
              </label>
              <input
                type="text"
                required
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="AMB-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modèle *
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Mercedes Sprinter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacité (patients)
              </label>
              <select
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={1}>1 patient</option>
                <option value={2}>2 patients</option>
                <option value={3}>3 patients</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Ambulance['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="disponible">Disponible</option>
                <option value="en_mission">En mission</option>
                <option value="en_panne">En panne</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau de carburant (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.fuelLevel}
                onChange={(e) => setFormData({ ...formData, fuelLevel: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kilométrage
              </label>
              <input
                type="number"
                min="0"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Équipements
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ajouter un équipement"
              />
              <button
                type="button"
                onClick={addEquipment}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipment.map((equipment, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {equipment}
                  <button
                    type="button"
                    onClick={() => removeEquipment(equipment)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

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
              <span>{ambulance ? 'Modifier' : 'Ajouter'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmbulanceForm;