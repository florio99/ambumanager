import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, MapPin, Guitar as Hospital, Settings, FileText, Bell, Wrench, Calendar, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const getMenuItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Tableau de bord', path: '/' },
      { icon: Truck, label: 'Missions', path: '/missions' },
    ];

    if (user?.role === 'admin' || user?.role === 'regulateur') {
      return [
        ...baseItems,
        { icon: Truck, label: 'Ambulances', path: '/ambulances' },
        { icon: Hospital, label: 'Hôpitaux', path: '/hospitals' },
        { icon: Users, label: 'Personnel', path: '/personnel' },
        { icon: Calendar, label: 'Plannings', path: '/schedules' },
        { icon: Wrench, label: 'Maintenance', path: '/maintenance' },
        { icon: BarChart3, label: 'Rapports', path: '/reports' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Paramètres', path: '/settings' },
      ];
    }

    if (user?.role === 'ambulancier') {
      return [
        ...baseItems,
        { icon: MapPin, label: 'Ma position', path: '/location' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: FileText, label: 'Mes rapports', path: '/my-reports' },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-white shadow-lg h-full w-64 fixed left-0 top-16 z-40">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;