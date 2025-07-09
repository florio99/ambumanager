import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useAuthStore } from '../../store/authStore';
import { Personnel } from '../../types';

const ScheduleManagement: React.FC = () => {
  const { personnel } = useMissionStore();
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Lundi

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Jours du mois précédent pour compléter la première semaine
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(firstDay);
      day.setDate(firstDay.getDate() - i - 1);
      days.push(day);
    }

    // Jours du mois actuel
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(lastDay);
      day.setDate(lastDay.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getPersonnelForDay = (date: Date) => {
    return personnel.filter(p => {
      if (!p.currentShift) return false;
      const shiftDate = new Date(p.currentShift.start);
      return shiftDate.toDateString() === date.toDateString();
    });
  };

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'jour': return 'bg-blue-100 text-blue-800';
      case 'nuit': return 'bg-purple-100 text-purple-800';
      case 'weekend': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateHeader = () => {
    if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  const canModify = user?.role === 'admin' || user?.role === 'regulateur';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Plannings</h1>
          <p className="text-gray-600">
            Planification et suivi des équipes
          </p>
        </div>
        {canModify && (
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Plus className="h-4 w-4" />
            <span>Nouveau Planning</span>
          </button>
        )}
      </div>

      {/* Contrôles de navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDateHeader()}
            </h2>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Mois
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              Aujourd'hui
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Personnel en service</p>
              <p className="text-2xl font-bold text-gray-900">
                {personnel.filter(p => p.status === 'en_service').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Services jour</p>
              <p className="text-2xl font-bold text-gray-900">
                {personnel.filter(p => p.currentShift?.type === 'jour').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Services nuit</p>
              <p className="text-2xl font-bold text-gray-900">
                {personnel.filter(p => p.currentShift?.type === 'nuit').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En congé</p>
              <p className="text-2xl font-bold text-gray-900">
                {personnel.filter(p => p.status === 'conge').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vue du planning */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {viewMode === 'week' ? (
          <div className="p-6">
            <div className="grid grid-cols-8 gap-4">
              <div className="font-medium text-gray-900">Personnel</div>
              {getWeekDays(currentDate).map((day, index) => (
                <div key={index} className="text-center">
                  <div className="font-medium text-gray-900">
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {day.getDate()}
                  </div>
                </div>
              ))}
              
              {personnel.map((person) => (
                <React.Fragment key={person.id}>
                  <div className="py-3 border-t border-gray-200">
                    <div className="font-medium text-gray-900">
                      {person.firstName} {person.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{person.role}</div>
                  </div>
                  {getWeekDays(currentDate).map((day, dayIndex) => {
                    const dayPersonnel = getPersonnelForDay(day);
                    const isAssigned = dayPersonnel.some(p => p.id === person.id);
                    
                    return (
                      <div key={dayIndex} className="py-3 border-t border-gray-200">
                        {isAssigned && person.currentShift && (
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getShiftTypeColor(person.currentShift.type)}`}>
                            {person.currentShift.type}
                            <div className="text-xs mt-1">
                              {person.currentShift.start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                              {person.currentShift.end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="p-3 text-center font-medium text-gray-900 bg-gray-50">
                  {day}
                </div>
              ))}
              
              {getMonthDays(currentDate).map((day, index) => {
                const dayPersonnel = getPersonnelForDay(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border border-gray-200 ${
                      !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayPersonnel.slice(0, 3).map((person) => (
                        <div
                          key={person.id}
                          className={`text-xs px-1 py-0.5 rounded ${
                            person.currentShift ? getShiftTypeColor(person.currentShift.type) : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {person.firstName} {person.lastName[0]}.
                        </div>
                      ))}
                      {dayPersonnel.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayPersonnel.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Légende</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Service de jour</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Service de nuit</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Service weekend</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Pas de service</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;