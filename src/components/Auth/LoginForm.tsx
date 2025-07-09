import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Connexion réussie !');
        navigate('/');
      } else {
        toast.error('Identifiants incorrects');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { username: 'admin', role: 'Administrateur', description: 'Accès complet au système' },
    { username: 'regulateur', role: 'Régulateur', description: 'Gestion des missions et ressources' },
    { username: 'ambulancier', role: 'Ambulancier', description: 'Vue missions et localisation' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emergency-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">🚑</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            AmbulanceManager
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Système de gestion des transports ambulanciers
          </p>
        </div>

        {/* Formulaire de connexion */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10"
                  placeholder="Entrez votre nom d'utilisateur"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="h-5 w-5 text-primary-500 group-hover:text-primary-400" />
              </span>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>

        {/* Comptes de démonstration */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Comptes de démonstration</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Utilisez ces identifiants pour tester l'application (mot de passe: <code className="bg-gray-100 px-1 rounded">demo123</code>)
          </p>
          <div className="space-y-3">
            {demoAccounts.map((account) => (
              <div
                key={account.username}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => {
                  setUsername(account.username);
                  setPassword('demo123');
                }}
              >
                <div>
                  <p className="font-medium text-gray-900">{account.username}</p>
                  <p className="text-sm text-gray-600">{account.role}</p>
                </div>
                <p className="text-xs text-gray-500">{account.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;