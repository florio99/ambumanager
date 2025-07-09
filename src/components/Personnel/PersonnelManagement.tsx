import React, { useState } from 'react';
import { Plus, Search, Filter, User, Phone, Mail, Clock, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useAuthStore } from '../../store/authStore';
import { Personnel } from '../../types';
import toast from 'react-hot-toast';
import PersonnelForm from './PersonnelForm';

const PersonnelManagement: React.FC = () => {
  const { personnel, addPersonnel, updatePersonnel, deletePersonnel } = useMissionStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);

  const filteredPersonnel = personnel.filter((person) => {
    const matchesSearch = 
      person.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || person.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_service': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'disponible': return <User className="h-4 w-4 text-blue-500" />;
      case 'repos': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'conge': return <UserX className="h-4 w-4 text-red-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_service': return 'text-green-600 bg-green-100 border-green-200';
      case 'disponible': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'repos': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'conge': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ambulancier': return 'text-blue-600 bg-blue-100';
      case 'paramedic': return 'text-green-600 bg-green-100';
      case 'medecin': return 'text-purple-600 bg-purple-100';
      case 'regulateur': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleEdit = (person: Personnel) => {
    setEditingPersonnel(person);
    setShowForm(true);
  };

  const handleDelete = (personnelId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre du personnel ?')) {
      deletePersonnel(personnelId);
      toast.success('Personnel supprimé');
    }
  };

  const handleFormSubmit = (personnelData: Partial<Personnel>) => {
    if (editingPersonnel) {
      updatePersonnel(editingPersonnel.id, personnelData);
      toast.success('Personnel mis à jour');
    } else {
      addPersonnel(personnelData as Omit<Personnel, 'id'>);
      toast.success('Personnel ajouté');
    }
    setShowForm(false);
    setEditingPersonnel(null);
  };

  const canModify = user?.role === 'admin' || user?.role === 'regulateur';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Personnel</h1>
          <p className="text-gray-600">
            {filteredPersonnel.length} membre{filteredPersonnel.length > 1 ? 's' : ''} du personnel trouvé{filteredPersonnel.length > 1 ? 's' : ''}
          </p>
        </div>
        {canModify && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Personnel</span>
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tous les rôles</option>
            <option value="ambulancier">Ambulancier</option>
            <option value="paramedic">Paramédic</option>
            <option value="medecin">Médecin</option>
            <option value="regulateur">Régulateur</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_service">En service</option>
            <option value="disponible">Disponible</option>
            <option value="repos">Repos</option>
            <option value="conge">Congé</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <Filter className="h-4 w-4" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En service</p>
              <p className="text-2xl font-bold text-gray-900">
                {personnel.filter(p => p.status === 'en_service').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disponible</p>
              <p className="text-2xl font-bold text-gray-900">
                {personnel.filter(p => p.status === 'disponible').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Repos</p>
              <p className="text-2xl font-bold text-gray-900">
                {personnel.filter(p => p.status === 'repos').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Congé</p>
              <p className="text-2xl font-bold text-gray-900">
                {personnel.filter(p => p.status === 'conge').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste du personnel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personnel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualifications
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPersonnel.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {person.firstName[0]}{person.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {person.firstName} {person.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {person.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(person.role)}`}>
                      {person.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(person.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(person.status)}`}>
                        {person.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Phone className="h-3 w-3 text-gray-400 mr-1" />
                        {person.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 text-gray-400 mr-1" />
                        {person.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {person.currentShift ? (
                      <div className="text-sm text-gray-900">
                        <div>{person.currentShift.type}</div>
                        <div className="text-xs text-gray-500">
                          {person.currentShift.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                          {person.currentShift.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Aucun service</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {person.qualification.slice(0, 2).map((qual, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                        >
                          {qual}
                        </span>
                      ))}
                      {person.qualification.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{person.qualification.length - 2} autres
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canModify && (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(person)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(person.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPersonnel.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun personnel trouvé</h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche ou ajoutez un nouveau membre du personnel.
            </p>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <PersonnelForm
          personnel={editingPersonnel}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPersonnel(null);
          }}
        />
      )}
    </div>
  );
};

export default PersonnelManagement;