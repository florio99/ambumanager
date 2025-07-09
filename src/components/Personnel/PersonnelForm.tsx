import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { Personnel } from '../../types';

interface PersonnelFormProps {
  personnel?: Personnel | null;
  onSubmit: (data: Partial<Personnel>) => void;
  onCancel: () => void;
}

const PersonnelForm: React.FC<PersonnelFormProps> = ({ personnel, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    role: 'ambulancier' as Personnel['role'],
    qualification: [] as string[],
    phone: '',
    email: '',
    status: 'disponible' as Personnel['status'],
    currentShift: null as Personnel['currentShift'],
    assignedAmbulance: '',
  });

  const [newQualification, setNewQualification] = useState('');
  const [hasShift, setHasShift] = useState(false);

  useEffect(() => {
    if (personnel) {
      setFormData({
        userId: personnel.userId,
        firstName: personnel.firstName,
        lastName: personnel.lastName,
        role: personnel.role,
        qualification: personnel.qualification,
        phone: personnel.phone,
        email: personnel.email,
        status: personnel.status,
        currentShift: personnel.currentShift || null,
        assignedAmbulance: personnel.assignedAmbulance || '',
      });
      setHasShift(!!personnel.currentShift);
    }
  }, [personnel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: Partial<Personnel> = {
      ...formData,
      currentShift: hasShift ? formData.currentShift : undefined,
    };

    if (!personnel) {
      submitData.userId = Date.now().toString();
    }

    onSubmit(submitData);
  };

  const addQualification = () => {
    if (newQualification.trim() && !formData.qualification.includes(newQualification.trim())) {
      setFormData({
        ...formData,
        qualification: [...formData.qualification, newQualification.trim()],
      });
      setNewQualification('');
    }
  };

  const removeQualification = (qualification: string) => {
    setFormData({
      ...formData,
      qualification: formData.qualification.filter(q => q !== qualification),
    });
  };

  const handleShiftChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      currentShift: {
        ...formData.currentShift!,
        [field]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {personnel ? 'Modifier le personnel' : 'Nouveau personnel'}
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
                Prénom *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Pierre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Martin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Personnel['role'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ambulancier">Ambulancier</option>
                <option value="paramedic">Paramédic</option>
                <option value="medecin">Médecin</option>
                <option value="regulateur">Régulateur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Personnel['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="disponible">Disponible</option>
                <option value="en_service">En service</option>
                <option value="repos">Repos</option>
                <option value="conge">Congé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="+33123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="pierre.martin@ambulance.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualifications
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ajouter une qualification"
              />
              <button
                type="button"
                onClick={addQualification}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.qualification.map((qual, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {qual}
                  <button
                    type="button"
                    onClick={() => removeQualification(qual)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="hasShift"
                checked={hasShift}
                onChange={(e) => {
                  setHasShift(e.target.checked);
                  if (e.target.checked && !formData.currentShift) {
                    setFormData({
                      ...formData,
                      currentShift: {
                        start: new Date(),
                        end: new Date(),
                        type: 'jour',
                      },
                    });
                  }
                }}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="hasShift" className="ml-2 block text-sm text-gray-900">
                Assigner un service actuel
              </label>
            </div>

            {hasShift && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de service
                  </label>
                  <select
                    value={formData.currentShift?.type || 'jour'}
                    onChange={(e) => handleShiftChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="jour">Jour</option>
                    <option value="nuit">Nuit</option>
                    <option value="weekend">Weekend</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={formData.currentShift?.start ? 
                      formData.currentShift.start.toTimeString().slice(0, 5) : '08:00'}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const date = new Date();
                      date.setHours(parseInt(hours), parseInt(minutes));
                      handleShiftChange('start', date);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={formData.currentShift?.end ? 
                      formData.currentShift.end.toTimeString().slice(0, 5) : '20:00'}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const date = new Date();
                      date.setHours(parseInt(hours), parseInt(minutes));
                      handleShiftChange('end', date);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}
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
              <span>{personnel ? 'Modifier' : 'Ajouter'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelForm;