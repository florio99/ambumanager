import axios from 'axios';
import { User, Mission, Ambulance, Hospital } from '../types';

// Configuration de base d'Axios
const API_BASE_URL = 'https://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const { access_token } = response.data;
    localStorage.setItem('auth-token', access_token);
    return access_token;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth-token');
  },
};

// Services pour les utilisateurs
export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/');
    return response.data;
  },

  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};

// Services pour les ambulances
export const ambulanceService = {
  getAmbulances: async (): Promise<Ambulance[]> => {
    const response = await api.get('/ambulances/');
    return response.data;
  },

  getAvailableAmbulances: async (): Promise<Ambulance[]> => {
    const response = await api.get('/ambulances/available');
    return response.data;
  },

  createAmbulance: async (ambulanceData: Omit<Ambulance, 'id'>): Promise<Ambulance> => {
    const response = await api.post('/ambulances/', ambulanceData);
    return response.data;
  },

  updateAmbulance: async (ambulanceId: string, ambulanceData: Partial<Ambulance>): Promise<Ambulance> => {
    const response = await api.put(`/ambulances/${ambulanceId}`, ambulanceData);
    return response.data;
  },

  updateAmbulanceLocation: async (ambulanceId: string, location: { latitude: number; longitude: number }): Promise<Ambulance> => {
    const response = await api.put(`/ambulances/${ambulanceId}/location`, location);
    return response.data;
  },

  updateAmbulanceStatus: async (ambulanceId: string, status: string): Promise<Ambulance> => {
    const response = await api.put(`/ambulances/${ambulanceId}/status`, { status });
    return response.data;
  },

  deleteAmbulance: async (ambulanceId: string): Promise<void> => {
    await api.delete(`/ambulances/${ambulanceId}`);
  },
};

// Services pour les missions
export const missionService = {
  getMissions: async (): Promise<Mission[]> => {
    const response = await api.get('/missions/');
    return response.data;
  },

  getActiveMissions: async (): Promise<Mission[]> => {
    const response = await api.get('/missions/active');
    return response.data;
  },

  getMissionsByStatus: async (status: string): Promise<Mission[]> => {
    const response = await api.get(`/missions/status/${status}`);
    return response.data;
  },

  createMission: async (missionData: Omit<Mission, 'id' | 'createdAt'>): Promise<Mission> => {
    const response = await api.post('/missions/', missionData);
    return response.data;
  },

  updateMission: async (missionId: string, missionData: Partial<Mission>): Promise<Mission> => {
    const response = await api.put(`/missions/${missionId}`, missionData);
    return response.data;
  },

  assignMission: async (missionId: string, assignment: { ambulance_id: string; personnel_ids: string[] }): Promise<Mission> => {
    const response = await api.post(`/missions/${missionId}/assign`, assignment);
    return response.data;
  },

  updateMissionStatus: async (missionId: string, status: string): Promise<Mission> => {
    const response = await api.put(`/missions/${missionId}/status`, { status });
    return response.data;
  },

  deleteMission: async (missionId: string): Promise<void> => {
    await api.delete(`/missions/${missionId}`);
  },
};

export default api;