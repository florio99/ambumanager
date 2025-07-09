import React, { useState, useEffect } from 'react';
import { X, Save, MapPin } from 'lucide-react';
import { Hospital } from '../../types';

interface HospitalFormProps {
  hospital?: Hospital | null;
  onSubmit: (data: Partial<Hospital>) => void;
  onCancel: () => void;
}

const HospitalForm: React.FC<HospitalFormProps> = ({ hospital, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    location: { lat: 48.8566, lng: 2.3522 },
    availableBeds: { emergency: 0, icu: 0, general: 0 },
    specialties: [] as string[],
    isActive: true,
  });

  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name,
        address: hospital.address,
        phone: hospital.phone,
        email: hospital.email,
        location: hospital.location,
        availableBeds: hospital.availableBeds,
        specialties: hospital.specialties,
        isActive: hospital.isActive,
      });
    }
  }, [hospital]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()],
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {hospital ? 'Modifier l\'hôpital' : 'Nouvel hôpital'}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'hôpital *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="CHU de Paris"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="47-83 Boulevard de l'Hôpital, 75013 Paris"
              />
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
                placeholder="+33142161000"
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
                placeholder="contact@chu-paris.fr"
              />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Localisation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.lat}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, lat: parseFloat(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.lng}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, lng: parseFloat(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Lits disponibles</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgences
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.availableBeds.emergency}
                  onChange={(e) => setFormData({
                    ...formData,
                    availableBeds: { ...formData.availableBeds, emergency: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réanimation
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.availableBeds.icu}
                  onChange={(e) => setFormData({
                    ...formData,
                    availableBeds: { ...formData.availableBeds, icu: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Général
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.availableBeds.general}
                  onChange={(e) => setFormData({
                    ...formData,
                    availableBeds: { ...formData.availableBeds, general: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spécialités
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ajouter une spécialité"
              />
              <button
                type="button"
                onClick={addSpecialty}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Hôpital actif
            </label>
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
              <span>{hospital ? 'Modifier' : 'Ajouter'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalForm;