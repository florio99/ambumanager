import React, { useState } from 'react';
import { Plus, Search, Filter, MapPin, Fuel, Settings, Wrench, CheckCircle, AlertTriangle, Clock, Edit, Trash2 } from 'lucide-react';
import { Users } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useAuthStore } from '../../store/authStore';
import { Ambulance } from '../../types';
import toast from 'react-hot-toast';
import AmbulanceForm from './AmbulanceForm';
import AmbulanceMap from './AmbulanceMap';
import AmbulanceAssignment from './AmbulanceAssignment';

const AmbulanceManagement: React.FC = () => {
  const { ambulances, updateAmbulanceStatus, deleteAmbulance, addAmbulance, updateAmbulance } = useMissionStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);

  const filteredAmbulances = ambulances.filter((ambulance) => {
    const matchesSearch = 
      ambulance.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambulance.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ambulance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'disponible': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'en_mission': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'en_panne': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'text-green-600 bg-green-100 border-green-200';
      case 'en_mission': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'en_panne': return 'text-red-600 bg-red-100 border-red-200';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStatusChange = (ambulanceId: string, newStatus: Ambulance['status']) => {
    updateAmbulanceStatus(ambulanceId, newStatus);
    toast.success('Statut de l\'ambulance mis à jour');
  };

  const handleDelete = (ambulanceId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ambulance ?')) {
      deleteAmbulance(ambulanceId);
      toast.success('Ambulance supprimée');
    }
  };

  const handleEdit = (ambulance: Ambulance) => {
    setEditingAmbulance(ambulance);
    setShowForm(true);
  };

  const handleFormSubmit = (ambulanceData: Partial<Ambulance>) => {
    if (editingAmbulance) {
      updateAmbulance(editingAmbulance.id, ambulanceData);
      toast.success('Ambulance mise à jour');
    } else {
      addAmbulance(ambulanceData as Omit<Ambulance, 'id'>);
      toast.success('Ambulance ajoutée');
    }
    setShowForm(false);
    setEditingAmbulance(null);
  };

  const canModify = user?.role === 'admin' || user?.role === 'regulateur';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Ambulances</h1>
          <p className="text-gray-600">
            {filteredAmbulances.length} ambulance{filteredAmbulances.length > 1 ? 's' : ''} trouvée{filteredAmbulances.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <MapPin className="h-4 w-4" />
            <span>{showMap ? 'Masquer' : 'Voir'} la carte</span>
          </button>
          <button
            onClick={() => setShowAssignment(!showAssignment)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Users className="h-4 w-4" />
            <span>{showAssignment ? 'Masquer' : 'Voir'} les assignations</span>
          </button>
          {canModify && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle Ambulance</span>
            </button>
          )}
        </div>
      </div>

      {/* Carte des ambulances */}
      {showMap && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation des Ambulances</h3>
          <AmbulanceMap ambulances={ambulances} />
        </div>
      )}

      {/* Vue des assignations */}
      {showAssignment && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestion des Assignations</h3>
          <AmbulanceAssignment showAvailableOnly={false} />
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par plaque ou modèle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="disponible">Disponible</option>
            <option value="en_mission">En mission</option>
            <option value="en_panne">En panne</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <Filter className="h-4 w-4" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">
                {ambulances.filter(a => a.status === 'disponible').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En mission</p>
              <p className="text-2xl font-bold text-gray-900">
                {ambulances.filter(a => a.status === 'en_mission').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En panne</p>
              <p className="text-2xl font-bold text-gray-900">
                {ambulances.filter(a => a.status === 'en_panne').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Wrench className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">
                {ambulances.filter(a => a.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des ambulances */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ambulance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carburant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kilométrage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personnel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAmbulances.map((ambulance) => (
                <tr key={ambulance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Settings className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {ambulance.plateNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ambulance.model}
                        </div>
                        <div className="text-xs text-gray-400">
                          Capacité: {ambulance.capacity} patients
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(ambulance.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ambulance.status)}`}>
                        {ambulance.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Fuel className={`h-4 w-4 mr-2 ${getFuelLevelColor(ambulance.fuelLevel)}`} />
                      <span className={`text-sm font-medium ${getFuelLevelColor(ambulance.fuelLevel)}`}>
                        {ambulance.fuelLevel}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ambulance.mileage.toLocaleString()} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {ambulance.assignedPersonnel.length} / {ambulance.capacity + 1}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ambulance.assignedPersonnel.length > 0 ? 'Assigné' : 'Non assigné'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {ambulance.location.lat.toFixed(4)}, {ambulance.location.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Mis à jour: {ambulance.location.lastUpdate.toLocaleTimeString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {canModify && (
                        <>
                          <select
                            value={ambulance.status}
                            onChange={(e) => handleStatusChange(ambulance.id, e.target.value as Ambulance['status'])}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="disponible">Disponible</option>
                            <option value="en_mission">En mission</option>
                            <option value="en_panne">En panne</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                          <button
                            onClick={() => handleEdit(ambulance)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ambulance.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAmbulances.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Settings className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune ambulance trouvée</h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche ou ajoutez une nouvelle ambulance.
            </p>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <AmbulanceForm
          ambulance={editingAmbulance}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAmbulance(null);
          }}
        />
      )}
    </div>
  );
};

export default AmbulanceManagement;