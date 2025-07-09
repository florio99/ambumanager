import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Palette, Globe, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const SettingsManagement: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      criticalOnly: false,
    },
    system: {
      language: 'fr',
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light',
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
    },
  });

  const tabs = [
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'system', name: 'Système', icon: Settings },
    { id: 'security', name: 'Sécurité', icon: Shield },
  ];

  const handleSave = () => {
    if (activeTab === 'profile') {
      updateUser(settings.profile);
    }
    toast.success('Paramètres sauvegardés');
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom
            </label>
            <input
              type="text"
              value={settings.profile.firstName}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, firstName: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={settings.profile.lastName}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, lastName: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, email: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => setSettings({
                ...settings,
                profile: { ...settings.profile, phone: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Photo de profil</h3>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-lg">
              {settings.profile.firstName[0]}{settings.profile.lastName[0]}
            </span>
          </div>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200">
            Changer la photo
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Préférences de notification</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notifications par email</h4>
              <p className="text-sm text-gray-500">Recevoir les notifications importantes par email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, emailNotifications: e.target.checked }
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notifications push</h4>
              <p className="text-sm text-gray-500">Recevoir les notifications en temps réel</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, pushNotifications: e.target.checked }
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notifications SMS</h4>
              <p className="text-sm text-gray-500">Recevoir les alertes critiques par SMS</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, smsNotifications: e.target.checked }
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Notifications critiques uniquement</h4>
              <p className="text-sm text-gray-500">Ne recevoir que les notifications de haute priorité</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.criticalOnly}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, criticalOnly: e.target.checked }
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres système</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Langue
            </label>
            <select
              value={settings.system.language}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, language: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuseau horaire
            </label>
            <select
              value={settings.system.timezone}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, timezone: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format de date
            </label>
            <select
              value={settings.system.dateFormat}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, dateFormat: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thème
            </label>
            <select
              value={settings.system.theme}
              onChange={(e) => setSettings({
                ...settings,
                system: { ...settings.system, theme: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="auto">Automatique</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sécurité</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Authentification à deux facteurs</h4>
              <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, twoFactorAuth: e.target.checked }
              })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Délai d'expiration de session (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="480"
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration du mot de passe (jours)
            </label>
            <input
              type="number"
              min="30"
              max="365"
              value={settings.security.passwordExpiry}
              onChange={(e) => setSettings({
                ...settings,
                security: { ...settings.security, passwordExpiry: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
              Changer le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'system': return renderSystemSettings();
      case 'security': return renderSecuritySettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">
          Gérez vos préférences et paramètres du système
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation des onglets */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des paramètres */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderTabContent()}
            
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={handleSave}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors duration-200"
              >
                <Save className="h-4 w-4" />
                <span>Sauvegarder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;