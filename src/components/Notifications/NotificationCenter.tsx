import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, X, Filter, BookMarked as MarkAsRead } from 'lucide-react';
import { useMissionStore } from '../../store/missionStore';
import { useAuthStore } from '../../store/authStore';
import { Notification } from '../../types';

const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationAsRead, deleteNotification } = useMissionStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'critical') return notification.priority === 'critical';
    return true;
  }).filter(notification => {
    // Filtrer par rôle si spécifié
    if (notification.role && notification.role !== user?.role) return false;
    if (notification.userId && notification.userId !== user?.id) return false;
    return true;
  });

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'critical') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    
    switch (type) {
      case 'mission': return <Bell className="h-5 w-5 text-blue-500" />;
      case 'emergency': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'maintenance': return <Info className="h-5 w-5 text-yellow-500" />;
      case 'system': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const markAllAsRead = () => {
    filteredNotifications.forEach(notification => {
      if (!notification.isRead) {
        markNotificationAsRead(notification.id);
      }
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centre de Notifications</h1>
          <p className="text-gray-600">
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                filter === 'all' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                filter === 'unread' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Non lues ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                filter === 'critical' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Critiques ({notifications.filter(n => n.priority === 'critical').length})
            </button>
          </div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? 'Toutes vos notifications ont été lues.'
                : filter === 'critical'
                ? 'Aucune notification critique pour le moment.'
                : 'Vous n\'avez aucune notification.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 border border-gray-200 p-6 transition-all duration-200 hover:shadow-md ${
                getPriorityColor(notification.priority)
              } ${!notification.isRead ? 'ring-2 ring-blue-100' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        notification.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className={`text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'} mb-2`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{notification.createdAt.toLocaleDateString('fr-FR')}</span>
                      <span>{notification.createdAt.toLocaleTimeString('fr-FR')}</span>
                      <span className="capitalize">{notification.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Marquer comme lu"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Supprimer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {notification.actionUrl && (
                <div className="mt-4">
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Voir les détails →
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;