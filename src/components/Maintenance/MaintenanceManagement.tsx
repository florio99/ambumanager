import React, { useState } from 'react';
import { Plus, Search, Filter, Wrench, Calendar, DollarSign, CheckCircle, Clock, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useAuthStore } from '../../store/authStore';
import { MaintenanceRecord } from '../../types';
import toast from 'react-hot-toast';
import MaintenanceForm from './MaintenanceForm';

const MaintenanceManagement: React.FC = () => {
  const { maintenanceRecords, ambulances, addMaintenanceRecord, updateMaintenanceRecord, deleteMaintenanceRecord } = useMissionStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  const filteredRecords = maintenanceRecords.filter((record) => {
    const ambulance = ambulances.find(a => a.id === record.ambulanceId);
    const matchesSearch = 
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ambulance?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.technician.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planifiee': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'en_cours': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'terminee': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'reportee': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planifiee': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'en_cours': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'terminee': return 'text-green-600 bg-green-100 border-green-200';
      case 'reportee': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preventive': return 'text-green-600 bg-green-100';
      case 'corrective': return 'text-orange-600 bg-orange-100';
      case 'urgente': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = (recordId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement de maintenance ?')) {
      deleteMaintenanceRecord(recordId);
      toast.success('Enregistrement de maintenance supprimé');
    }
  };

  const handleFormSubmit = (recordData: Partial<MaintenanceRecord>) => {
    if (editingRecord) {
      updateMaintenanceRecord(editingRecord.id, recordData);
      toast.success('Maintenance mise à jour');
    } else {
      addMaintenanceRecord(recordData as Omit<MaintenanceRecord, 'id'>);
      toast.success('Maintenance planifiée');
    }
    setShowForm(false);
    setEditingRecord(null);
  };

  const getTotalCost = () => {
    return filteredRecords.reduce((total, record) => total + record.cost, 0);
  };

  const canModify = user?.role === 'admin' || user?.role === 'regulateur';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de la Maintenance</h1>
          <p className="text-gray-600">
            {filteredRecords.length} enregistrement{filteredRecords.length > 1 ? 's' : ''} de maintenance
          </p>
        </div>
        {canModify && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Maintenance</span>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="planifiee">Planifiée</option>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
            <option value="reportee">Reportée</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Tous les types</option>
            <option value="preventive">Préventive</option>
            <option value="corrective">Corrective</option>
            <option value="urgente">Urgente</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Planifiées</p>
              <p className="text-2xl font-bold text-gray-900">
                {maintenanceRecords.filter(r => r.status === 'planifiee').length}
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
              <p className="text-sm font-medium text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-gray-900">
                {maintenanceRecords.filter(r => r.status === 'en_cours').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-gray-900">
                {maintenanceRecords.filter(r => r.status === 'terminee').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Coût total</p>
              <p className="text-2xl font-bold text-gray-900">
                {getTotalCost().toLocaleString()} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des maintenances */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ambulance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date prévue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technicien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coût
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => {
                const ambulance = ambulances.find(a => a.id === record.ambulanceId);
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {ambulance?.plateNumber || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ambulance?.model || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {record.description}
                      </div>
                      {record.parts.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Pièces: {record.parts.slice(0, 2).join(', ')}
                          {record.parts.length > 2 && ` +${record.parts.length - 2}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(record.status)}`}>
                          {record.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.scheduledDate.toLocaleDateString('fr-FR')}
                      {record.completedDate && (
                        <div className="text-xs text-gray-500">
                          Terminée: {record.completedDate.toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.technician}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.cost.toLocaleString()} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canModify && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Wrench className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune maintenance trouvée</h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche ou planifiez une nouvelle maintenance.
            </p>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <MaintenanceForm
          record={editingRecord}
          ambulances={ambulances}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
};

export default MaintenanceManagement;