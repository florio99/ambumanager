import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MapPin, Clock, User, Phone, Guitar as Hospital, AlertTriangle, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useAuthStore } from '../../store/authStore';
import { Mission } from '../../types';
import toast from 'react-hot-toast';
import MissionForm from './MissionForm';
import MissionDetails from './MissionDetails';
import AmbulanceAssignment from '../Ambulances/AmbulanceAssignment';

const MissionList: React.FC = () => {
  const { missions, updateMissionStatus, deleteMission, assignMission, getAvailableAmbulances, fetchMissions, addMission } = useMissionStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsMission, setDetailsMission] = useState<Mission | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignmentMission, setAssignmentMission] = useState<Mission | null>(null);

  const availableAmbulances = getAvailableAmbulances();

  // Charger les missions au montage du composant
  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const filteredMissions = missions.filter((mission) => {
    const matchesSearch = 
      mission.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.patientCondition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.pickupLocation.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || mission.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critique': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'urgente': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'normale': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'faible': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_attente': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'assignee': return <User className="h-4 w-4 text-blue-500" />;
      case 'en_cours': return <MapPin className="h-4 w-4 text-green-500" />;
      case 'terminee': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'annulee': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critique': return 'text-red-600 bg-red-100 border-red-200';
      case 'urgente': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'normale': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'faible': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'assignee': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'en_cours': return 'text-green-600 bg-green-100 border-green-200';
      case 'terminee': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'annulee': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const handleStatusChange = (missionId: string, newStatus: Mission['status']) => {
    updateMissionStatus(missionId, newStatus);
    toast.success('Statut de la mission mis à jour');
  };

  const handleAssignMission = (missionId: string, ambulanceId: string) => {
    assignMission(missionId, ambulanceId, ['1', '2']); // Personnel par défaut
    toast.success('Mission assignée avec succès');
  };

  const handleDeleteMission = (missionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      deleteMission(missionId);
      toast.success('Mission supprimée');
    }
  };

  const handleEdit = (mission: Mission) => {
    setEditingMission(mission);
    setShowForm(true);
  };

  const handleFormSubmit = (missionData: Partial<Mission>) => {
    if (editingMission) {
      updateMission(editingMission.id, missionData);
      toast.success('Mission mise à jour');
    } else {
      addMission(missionData as Omit<Mission, 'id' | 'createdAt'>);
      toast.success('Mission créée avec succès');
    }
    setShowForm(false);
    setEditingMission(null);
  };

  const handleViewDetails = (mission: Mission) => {
    setDetailsMission(mission);
    setShowDetails(true);
  };

  const handleShowAssignment = (mission: Mission) => {
    setAssignmentMission(mission);
    setShowAssignment(true);
  };

  const handleAssignmentComplete = () => {
    setShowAssignment(false);
    setAssignmentMission(null);
    toast.success('Mission assignée avec succès');
  };

  const canModifyMission = (mission: Mission) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'regulateur') return true;
    if (user?.role === 'ambulancier' && mission.assignedPersonnel.includes(user.id)) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Missions</h1>
          <p className="text-gray-600">
            {filteredMissions.length} mission{filteredMissions.length > 1 ? 's' : ''} trouvée{filteredMissions.length > 1 ? 's' : ''}
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'regulateur') && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Mission</span>
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtre par statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="assignee">Assignée</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>

          {/* Filtre par priorité */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="critique">Critique</option>
            <option value="urgente">Urgente</option>
            <option value="normale">Normale</option>
            <option value="faible">Faible</option>
          </select>

          {/* Bouton de réinitialisation */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <Filter className="h-4 w-4" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Liste des missions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créée le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMissions.map((mission) => (
                <tr key={mission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div 
                          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary-600"
                          onClick={() => handleViewDetails(mission)}
                        >
                          {mission.patientName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {mission.patientCondition}
                        </div>
                        {mission.patientPhone && (
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {mission.patientPhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPriorityIcon(mission.priority)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(mission.priority)}`}>
                        {mission.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(mission.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(mission.status)}`}>
                        {mission.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {mission.pickupLocation.address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Hospital className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="max-w-xs truncate">{mission.destination.hospitalName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(mission.createdAt).toLocaleDateString('fr-FR')}
                    <br />
                    {new Date(mission.createdAt).toLocaleTimeString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Actions selon le rôle et le statut */}
                      {mission.status === 'en_attente' && availableAmbulances.length > 0 && (user?.role === 'admin' || user?.role === 'regulateur') && (
                        <button
                          onClick={() => handleShowAssignment(mission)}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors duration-200"
                        >
                          Assigner
                        </button>
                      )}

                      {mission.status === 'assignee' && canModifyMission(mission) && (
                        <button
                          onClick={() => handleStatusChange(mission.id, 'en_cours')}
                          className="text-green-600 hover:text-green-900 text-xs"
                        >
                          Démarrer
                        </button>
                      )}

                      {mission.status === 'en_cours' && canModifyMission(mission) && (
                        <button
                          onClick={() => handleStatusChange(mission.id, 'terminee')}
                          className="text-blue-600 hover:text-blue-900 text-xs"
                        >
                          Terminer
                        </button>
                      )}

                      {canModifyMission(mission) && mission.status !== 'terminee' && (
                        <>
                          <button 
                            onClick={() => handleEdit(mission)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMission(mission.id)}
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

        {filteredMissions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mission trouvée</h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche ou créez une nouvelle mission.
            </p>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <MissionForm
          mission={editingMission}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingMission(null);
          }}
        />
      )}

      {/* Détails de la mission */}
      {showDetails && detailsMission && (
        <MissionDetails
          mission={detailsMission}
          onClose={() => {
            setShowDetails(false);
            setDetailsMission(null);
          }}
        />
      )}

      {/* Modal d'assignation d'ambulance */}
      {showAssignment && assignmentMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Assigner des ressources à la mission
              </h3>
              <button
                onClick={() => setShowAssignment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <AmbulanceAssignment
                mission={assignmentMission}
                onAssign={handleAssignmentComplete}
                showAvailableOnly={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionList;