import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { MaintenanceRecord, Ambulance } from '../../types';

interface MaintenanceFormProps {
  record?: MaintenanceRecord | null;
  ambulances: Ambulance[];
  onSubmit: (data: Partial<MaintenanceRecord>) => void;
  onCancel: () => void;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ record, ambulances, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    ambulanceId: '',
    type: 'preventive' as MaintenanceRecord['type'],
    description: '',
    cost: 0,
    scheduledDate: new Date(),
    status: 'planifiee' as MaintenanceRecord['status'],
    technician: '',
    parts: [] as string[],
    notes: '',
  });

  const [newPart, setNewPart] = useState('');

  useEffect(() => {
    if (record) {
      setFormData({
        ambulanceId: record.ambulanceId,
        type: record.type,
        description: record.description,
        cost: record.cost,
        scheduledDate: record.scheduledDate,
        status: record.status,
        technician: record.technician,
        parts: record.parts,
        notes: record.notes,
      });
    }
  }, [record]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: Partial<MaintenanceRecord> = {
      ...formData,
      completedDate: formData.status === 'terminee' ? new Date() : undefined,
    };

    onSubmit(submitData);
  };

  const addPart = () => {
    if (newPart.trim() && !formData.parts.includes(newPart.trim())) {
      setFormData({
        ...formData,
        parts: [...formData.parts, newPart.trim()],
      });
      setNewPart('');
    }
  };

  const removePart = (part: string) => {
    setFormData({
      ...formData,
      parts: formData.parts.filter(p => p !== part),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {record ? 'Modifier la maintenance' : 'Nouvelle maintenance'}
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
                Ambulance *
              </label>
              <select
                required
                value={formData.ambulanceId}
                onChange={(e) => setFormData({ ...formData, ambulanceId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Sélectionner une ambulance</option>
                {ambulances.map((ambulance) => (
                  <option key={ambulance.id} value={ambulance.id}>
                    {ambulance.plateNumber} - {ambulance.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de maintenance *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceRecord['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="preventive">Préventive</option>
                <option value="corrective">Corrective</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Description détaillée de la maintenance..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date prévue *
              </label>
              <input
                type="date"
                required
                value={formData.scheduledDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, scheduledDate: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceRecord['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="planifiee">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="reportee">Reportée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technicien *
              </label>
              <input
                type="text"
                required
                value={formData.technician}
                onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Nom du technicien"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coût estimé (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pièces nécessaires
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newPart}
                onChange={(e) => setNewPart(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPart())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ajouter une pièce"
              />
              <button
                type="button"
                onClick={addPart}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.parts.map((part, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {part}
                  <button
                    type="button"
                    onClick={() => removePart(part)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Notes additionnelles..."
            />
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
              <span>{record ? 'Modifier' : 'Planifier'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;