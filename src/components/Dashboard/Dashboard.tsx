import React from 'react';
import { Truck, Users, Clock, CheckCircle, AlertTriangle, Activity, MapPin, Guitar as Hospital } from 'lucide-react';
import StatsCard from './StatsCard';
import { useMissionStore } from '../../store/missionStore';
import { useAuthStore } from '../../store/authStore';

const Dashboard: React.FC = () => {
  const { missions, ambulances, personnel } = useMissionStore();
  const { user } = useAuthStore();

  // Calculs des statistiques
  const activeMissions = missions.filter(m => 
    ['en_attente', 'assignee', 'en_cours'].includes(m.status)
  );
  
  const availableAmbulances = ambulances.filter(a => a.status === 'disponible');
  const activePersonnel = personnel.filter(p => p.status === 'en_service');
  
  const completedToday = missions.filter(m => 
    m.status === 'terminee' && 
    m.completedAt && 
    new Date(m.completedAt).toDateString() === new Date().toDateString()
  );

  const criticalMissions = missions.filter(m => 
    m.priority === 'critique' && m.status !== 'terminee'
  );

  const recentMissions = missions
    .filter(m => m.status !== 'terminee')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critique': return 'text-red-600 bg-red-100';
      case 'urgente': return 'text-orange-600 bg-orange-100';
      case 'normale': return 'text-blue-600 bg-blue-100';
      case 'faible': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'text-yellow-600 bg-yellow-100';
      case 'assignee': return 'text-blue-600 bg-blue-100';
      case 'en_cours': return 'text-green-600 bg-green-100';
      case 'terminee': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bienvenue, {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Dernière mise à jour</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Missions actives"
          value={activeMissions.length}
          icon={Activity}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatsCard
          title="Ambulances disponibles"
          value={`${availableAmbulances.length}/${ambulances.length}`}
          icon={Truck}
          color="green"
          subtitle={`${Math.round((availableAmbulances.length / ambulances.length) * 100)}% disponibles`}
        />
        
        <StatsCard
          title="Personnel en service"
          value={`${activePersonnel.length}/${personnel.length}`}
          icon={Users}
          color="purple"
          subtitle={`${Math.round((activePersonnel.length / personnel.length) * 100)}% actif`}
        />
        
        <StatsCard
          title="Missions terminées aujourd'hui"
          value={completedToday.length}
          icon={CheckCircle}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Alertes critiques */}
      {criticalMissions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">
              Missions critiques en attente
            </h3>
          </div>
          <div className="mt-2 space-y-2">
            {criticalMissions.map((mission) => (
              <div key={mission.id} className="flex items-center justify-between bg-white p-3 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">{mission.patientName}</p>
                  <p className="text-sm text-gray-600">{mission.patientCondition}</p>
                  <p className="text-xs text-gray-500">{mission.pickupLocation.address}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                    {mission.status.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(mission.createdAt).toLocaleTimeString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missions récentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Missions récentes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentMissions.map((mission) => (
                <div key={mission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{mission.patientName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(mission.priority)}`}>
                        {mission.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{mission.patientCondition}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {mission.pickupLocation.address}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                      {mission.status.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(mission.createdAt).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* État des ambulances */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">État des ambulances</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {ambulances.map((ambulance) => (
                <div key={ambulance.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{ambulance.plateNumber}</h4>
                      <p className="text-sm text-gray-600">{ambulance.model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ambulance.status === 'disponible' ? 'text-green-600 bg-green-100' :
                      ambulance.status === 'en_mission' ? 'text-blue-600 bg-blue-100' :
                      ambulance.status === 'en_panne' ? 'text-red-600 bg-red-100' :
                      'text-yellow-600 bg-yellow-100'
                    }`}>
                      {ambulance.status.replace('_', ' ')}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Carburant: {ambulance.fuelLevel}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;