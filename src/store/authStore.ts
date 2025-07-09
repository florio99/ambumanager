import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Données de démonstration
const demoUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'Système',
    email: 'admin@ambulance.com',
    phone: '+33123456789',
    isActive: true,
    lastLogin: new Date(),
  },
  {
    id: '2',
    username: 'regulateur',
    role: 'regulateur',
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@ambulance.com',
    phone: '+33123456790',
    isActive: true,
    lastLogin: new Date(),
  },
  {
    id: '3',
    username: 'ambulancier',
    role: 'ambulancier',
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'pierre.martin@ambulance.com',
    phone: '+33123456791',
    isActive: true,
    lastLogin: new Date(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (username: string, password: string) => {
        // Simulation d'une authentification
        if (password === 'demo123') {
          const user = demoUsers.find(u => u.username === username);
          if (user) {
            set({ user, isAuthenticated: true });
            return true;
          }
        }
        return false;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);