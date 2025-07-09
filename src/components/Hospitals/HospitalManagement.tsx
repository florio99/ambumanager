import React, { useState } from 'react';
import { Plus, Search, Filter, MapPin, Bed, Phone, Mail, Edit, Trash2, Building } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useAuthStore } from '../../store/authStore';
import { Hospital } from '../../types';
import toast from 'react-hot-toast';
import HospitalForm from './HospitalForm';

const HospitalManagement: React.FC = () => {
  const { hospitals, addHospital, updateHospital, deleteHospital } = useMissionStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleEdit = (hospital: Hospital) => {
    setEditingHospital(hospital);
    setShowForm(true);
  };

  const handleDelete = (hospitalId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet hôpital ?')) {
      deleteHospital(hospitalId);
      toast.success('Hôpital supprimé');
    }
  };

  const handleFormSubmit = (hospitalData: Partial<Hospital>) => {
    if (editingHospital) {
      updateHospital(editingHospital.id, hospitalData);
      toast.success('Hôpital mis à jour');
    } else {
      addHospital(hospitalData as Omit<Hospital, 'id'>);
      toast.success('Hôpital ajouté');
    }
    setShowForm(false);
    setEditingHospital(null);
  };

  const getTotalBeds = (hospital: Hospital) => {
    return hospital.availableBeds.emergency + hospital.availableBeds.icu + hospital.availableBeds.general;
  };

  const canModify = user?.role === 'admin' || user?.role === 'regulateur';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Hôpitaux</h1>
          <p className="text-gray-600">
            {filteredHospitals.length} hôpital{filteredHospitals.length > 1 ? 'x' : ''} trouvé{filteredHospitals.length > 1 ? 's' : ''}
          </p>
        </div>
        {canModify && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvel Hôpital</span>
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, adresse ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200"
          >
            <Filter className="h-4 w-4" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hôpitaux</p>
              <p className="text-2xl font-bold text-gray-900">{hospitals.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bed className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lits Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">
                {hospitals.reduce((total, h) => total + getTotalBeds(h), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Building className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lits Urgences</p>
              <p className="text-2xl font-bold text-gray-900">
                {hospitals.reduce((total, h) => total + h.availableBeds.emergency, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des hôpitaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{hospital.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hospital.address}
                  </div>
                </div>
              </div>
              {canModify && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(hospital)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(hospital.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-gray-600">{hospital.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-gray-600">{hospital.email}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Lits disponibles</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">{hospital.availableBeds.emergency}</div>
                    <div className="text-xs text-red-600">Urgences</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="text-lg font-bold text-orange-600">{hospital.availableBeds.icu}</div>
                    <div className="text-xs text-orange-600">Réanimation</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{hospital.availableBeds.general}</div>
                    <div className="text-xs text-blue-600">Général</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Spécialités</h4>
                <div className="flex flex-wrap gap-1">
                  {hospital.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun hôpital trouvé</h3>
          <p className="text-gray-500">
            Essayez de modifier vos critères de recherche ou ajoutez un nouvel hôpital.
          </p>
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <HospitalForm
          hospital={editingHospital}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingHospital(null);
          }}
        />
      )}
    </div>
  );
};

export default HospitalManagement;