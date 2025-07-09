import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, TrendingUp, Users, Truck, Clock, DollarSign } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useAuthStore } from '../../store/authStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ReportsManagement: React.FC = () => {
  const { missions, ambulances, personnel, maintenanceRecords } = useMissionStore();
  const { user } = useAuthStore();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });
  const [reportType, setReportType] = useState<'missions' | 'vehicles' | 'personnel' | 'maintenance'>('missions');

  // Données pour les graphiques
  const getMissionsByDay = () => {
    const days = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayMissions = missions.filter(m => 
        new Date(m.createdAt).toDateString() === d.toDateString()
      );
      
      days.push({
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        missions: dayMissions.length,
        completed: dayMissions.filter(m => m.status === 'terminee').length,
        critical: dayMissions.filter(m => m.priority === 'critique').length,
      });
    }
    
    return days;
  };

  const getMissionsByPriority = () => {
    const priorities = ['critique', 'urgente', 'normale', 'faible'];
    const colors = ['#EF4444', '#F97316', '#3B82F6', '#6B7280'];
    
    return priorities.map((priority, index) => ({
      name: priority,
      value: missions.filter(m => m.priority === priority).length,
      color: colors[index],
    }));
  };

  const getAmbulanceUtilization = () => {
    return ambulances.map(ambulance => {
      const ambulanceMissions = missions.filter(m => m.ambulanceId === ambulance.id);
      const completedMissions = ambulanceMissions.filter(m => m.status === 'terminee');
      const totalDuration = completedMissions.reduce((total, m) => total + (m.actualDuration || 0), 0);
      
      return {
        name: ambulance.plateNumber,
        missions: ambulanceMissions.length,
        duration: totalDuration,
        fuelLevel: ambulance.fuelLevel,
      };
    });
  };

  const getMaintenanceCosts = () => {
    const months = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      const monthRecords = maintenanceRecords.filter(r => 
        new Date(r.scheduledDate).getMonth() === d.getMonth() &&
        new Date(r.scheduledDate).getFullYear() === d.getFullYear()
      );
      
      months.push({
        month: d.toLocaleDateString('fr-FR', { month: 'short' }),
        cost: monthRecords.reduce((total, r) => total + r.cost, 0),
        preventive: monthRecords.filter(r => r.type === 'preventive').reduce((total, r) => total + r.cost, 0),
        corrective: monthRecords.filter(r => r.type === 'corrective').reduce((total, r) => total + r.cost, 0),
      });
    }
    
    return months;
  };

  const getStatistics = () => {
    const totalMissions = missions.length;
    const completedMissions = missions.filter(m => m.status === 'terminee').length;
    const averageResponseTime = completedMissions > 0 
      ? missions.filter(m => m.actualDuration).reduce((total, m) => total + (m.actualDuration || 0), 0) / completedMissions
      : 0;
    const totalMaintenanceCost = maintenanceRecords.reduce((total, r) => total + r.cost, 0);

    return {
      totalMissions,
      completedMissions,
      completionRate: totalMissions > 0 ? (completedMissions / totalMissions * 100).toFixed(1) : 0,
      averageResponseTime: averageResponseTime.toFixed(1),
      totalMaintenanceCost,
      activePersonnel: personnel.filter(p => p.status === 'en_service').length,
      availableAmbulances: ambulances.filter(a => a.status === 'disponible').length,
    };
  };

  const stats = getStatistics();

  const exportReport = () => {
    // Simulation d'export - dans un vrai projet, cela générerait un PDF ou Excel
    const reportData = {
      type: reportType,
      dateRange,
      statistics: stats,
      missions: missions,
      ambulances: ambulances,
      personnel: personnel,
      maintenance: maintenanceRecords,
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports et Statistiques</h1>
          <p className="text-gray-600">
            Analyse des performances et des données
          </p>
        </div>
        <button
          onClick={exportReport}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Download className="h-4 w-4" />
          <span>Exporter</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de rapport
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="missions">Missions</option>
              <option value="vehicles">Véhicules</option>
              <option value="personnel">Personnel</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex items-end">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors duration-200">
              <Filter className="h-4 w-4" />
              <span>Appliquer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Missions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMissions}</p>
              <p className="text-xs text-green-600">Taux de réussite: {stats.completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Temps moyen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageResponseTime}min</p>
              <p className="text-xs text-gray-500">Par mission</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Personnel actif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePersonnel}</p>
              <p className="text-xs text-gray-500">En service</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Coût maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMaintenanceCost.toLocaleString()}€</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques selon le type de rapport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportType === 'missions' && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Missions par jour</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMissionsByDay()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="missions" fill="#3B82F6" name="Total" />
                  <Bar dataKey="completed" fill="#10B981" name="Terminées" />
                  <Bar dataKey="critical" fill="#EF4444" name="Critiques" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par priorité</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getMissionsByPriority()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getMissionsByPriority().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {reportType === 'vehicles' && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisation des ambulances</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getAmbulanceUtilization()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="missions" fill="#3B82F6" name="Missions" />
                  <Bar dataKey="duration" fill="#10B981" name="Durée (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Niveau de carburant</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getAmbulanceUtilization()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="fuelLevel" fill="#F59E0B" name="Carburant %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {reportType === 'maintenance' && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coûts de maintenance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getMaintenanceCosts()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cost" stroke="#3B82F6" name="Total" />
                  <Line type="monotone" dataKey="preventive" stroke="#10B981" name="Préventive" />
                  <Line type="monotone" dataKey="corrective" stroke="#EF4444" name="Corrective" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques maintenance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-600">Maintenances planifiées</span>
                  <span className="text-lg font-bold text-blue-600">
                    {maintenanceRecords.filter(r => r.status === 'planifiee').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-600">En cours</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {maintenanceRecords.filter(r => r.status === 'en_cours').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-600">Terminées</span>
                  <span className="text-lg font-bold text-green-600">
                    {maintenanceRecords.filter(r => r.status === 'terminee').length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-600">Coût moyen</span>
                  <span className="text-lg font-bold text-purple-600">
                    {maintenanceRecords.length > 0 
                      ? (maintenanceRecords.reduce((total, r) => total + r.cost, 0) / maintenanceRecords.length).toFixed(0)
                      : 0}€
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsManagement;