import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './components/Dashboard/Dashboard';
import MissionList from './components/Missions/MissionList';
import AmbulanceManagement from './components/Ambulances/AmbulanceManagement';
import HospitalManagement from './components/Hospitals/HospitalManagement';
import PersonnelManagement from './components/Personnel/PersonnelManagement';
import ScheduleManagement from './components/Schedules/ScheduleManagement';
import MaintenanceManagement from './components/Maintenance/MaintenanceManagement';
import ReportsManagement from './components/Reports/ReportsManagement';
import NotificationCenter from './components/Notifications/NotificationCenter';
import SettingsManagement from './components/Settings/SettingsManagement';

// Composants temporaires pour les routes spécifiques aux ambulanciers
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-600">Cette fonctionnalité sera bientôt disponible.</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" /> : <LoginForm />
            }
          />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="missions" element={<MissionList />} />
            <Route path="ambulances" element={<AmbulanceManagement />} />
            <Route path="hospitals" element={<HospitalManagement />} />
            <Route path="personnel" element={<PersonnelManagement />} />
            <Route path="schedules" element={<ScheduleManagement />} />
            <Route path="maintenance" element={<MaintenanceManagement />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="settings" element={<SettingsManagement />} />
            <Route path="location" element={<ComingSoon title="Ma Position" />} />
            <Route path="my-reports" element={<ComingSoon title="Mes Rapports" />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;