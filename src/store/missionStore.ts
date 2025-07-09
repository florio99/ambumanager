import { create } from 'zustand';
import { Mission, Ambulance, Hospital, Personnel, MaintenanceRecord, Notification } from '../types';
import { missionService, ambulanceService } from '../services/api';

interface MissionState {
  missions: Mission[];
  ambulances: Ambulance[];
  hospitals: Hospital[];
  personnel: Personnel[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: Notification[];
  selectedMission: Mission | null;
  isLoading: boolean;
  
  // Actions Missions
  fetchMissions: () => Promise<void>;
  addMission: (mission: Omit<Mission, 'id' | 'createdAt'>) => Promise<void>;
  updateMission: (id: string, updates: Partial<Mission>) => Promise<void>;
  deleteMission: (id: string) => Promise<void>;
  assignMission: (missionId: string, ambulanceId: string, personnelIds: string[]) => Promise<void>;
  updateMissionStatus: (id: string, status: Mission['status']) => Promise<void>;
  setSelectedMission: (mission: Mission | null) => void;
  
  // Actions Ambulances
  fetchAmbulances: () => Promise<void>;
  addAmbulance: (ambulance: Omit<Ambulance, 'id'>) => Promise<void>;
  updateAmbulance: (id: string, updates: Partial<Ambulance>) => Promise<void>;
  deleteAmbulance: (id: string) => Promise<void>;
  updateAmbulanceStatus: (id: string, status: Ambulance['status']) => Promise<void>;
  updateAmbulanceLocation: (id: string, location: { lat: number; lng: number }) => Promise<void>;
  
  // Actions Hôpitaux (données locales pour l'instant)
  addHospital: (hospital: Omit<Hospital, 'id'>) => void;
  updateHospital: (id: string, updates: Partial<Hospital>) => void;
  deleteHospital: (id: string) => void;
  
  // Actions Personnel (données locales pour l'instant)
  addPersonnel: (personnel: Omit<Personnel, 'id'>) => void;
  updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;
  
  // Actions Maintenance (données locales pour l'instant)
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: string) => void;
  
  // Actions Notifications (données locales pour l'instant)
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  
  // Getters
  getAvailableAmbulances: () => Ambulance[];
  getMissionsByStatus: (status: Mission['status']) => Mission[];
  getActiveMissions: () => Mission[];
}

// Données de démonstration pour les entités non encore implémentées dans le backend
const demoHospitals: Hospital[] = [
  {
    id: '1',
    name: 'CHU de Paris',
    address: '47-83 Boulevard de l\'Hôpital, 75013 Paris',
    phone: '+33142161000',
    email: 'contact@chu-paris.fr',
    location: { lat: 48.8388, lng: 2.3619 },
    availableBeds: { emergency: 15, icu: 8, general: 45 },
    specialties: ['Cardiologie', 'Neurologie', 'Urgences', 'Réanimation'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Hôpital Saint-Louis',
    address: '1 Avenue Claude Vellefaux, 75010 Paris',
    phone: '+33142499000',
    email: 'contact@saint-louis.fr',
    location: { lat: 48.8719, lng: 2.3698 },
    availableBeds: { emergency: 12, icu: 6, general: 38 },
    specialties: ['Hématologie', 'Oncologie', 'Dermatologie'],
    isActive: true,
  },
];

const demoPersonnel: Personnel[] = [
  {
    id: '1',
    userId: '3',
    firstName: 'Pierre',
    lastName: 'Martin',
    role: 'ambulancier',
    qualification: ['Ambulancier DE', 'Secourisme'],
    phone: '+33123456791',
    email: 'pierre.martin@ambulance.com',
    status: 'en_service',
    currentShift: {
      start: new Date(2024, 0, 15, 8, 0),
      end: new Date(2024, 0, 15, 20, 0),
      type: 'jour',
    },
    assignedAmbulance: '1',
  },
  {
    id: '2',
    userId: '4',
    firstName: 'Sophie',
    lastName: 'Dubois',
    role: 'paramedic',
    qualification: ['Paramédic', 'Secourisme', 'Réanimation'],
    phone: '+33123456792',
    email: 'sophie.dubois@ambulance.com',
    status: 'en_service',
    currentShift: {
      start: new Date(2024, 0, 15, 8, 0),
      end: new Date(2024, 0, 15, 20, 0),
      type: 'jour',
    },
    assignedAmbulance: '1',
  },
];

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  ambulances: [],
  hospitals: demoHospitals,
  personnel: demoPersonnel,
  maintenanceRecords: [],
  notifications: [],
  selectedMission: null,
  isLoading: false,

  // Actions Missions
  fetchMissions: async () => {
    set({ isLoading: true });
    try {
      const missions = await missionService.getMissions();
      set({ missions, isLoading: false });
    } catch (error) {
      console.error('Error fetching missions:', error);
      set({ isLoading: false });
    }
  },

  addMission: async (missionData) => {
    try {
      const newMission = await missionService.createMission(missionData);
      set((state) => ({
        missions: [...state.missions, newMission],
      }));
      
      // Ajouter une notification pour les missions critiques
      if (missionData.priority === 'critique') {
        const { addNotification } = get();
        addNotification({
          type: 'mission',
          title: 'Nouvelle mission critique',
          message: `Mission critique créée pour ${missionData.patientName} - ${missionData.patientCondition}`,
          priority: 'critical',
          role: 'ambulancier',
          actionUrl: '/missions',
          isRead: false
        });
      }
    } catch (error) {
      console.error('Error creating mission:', error);
      throw error;
    }
  },

  updateMission: async (id, updates) => {
    try {
      const updatedMission = await missionService.updateMission(id, updates);
      set((state) => ({
        missions: state.missions.map((mission) =>
          mission.id === id ? updatedMission : mission
        ),
      }));
    } catch (error) {
      console.error('Error updating mission:', error);
      throw error;
    }
  },

  deleteMission: async (id) => {
    try {
      await missionService.deleteMission(id);
      set((state) => ({
        missions: state.missions.filter((mission) => mission.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting mission:', error);
      throw error;
    }
  },

  assignMission: async (missionId, ambulanceId, personnelIds) => {
    try {
      const updatedMission = await missionService.assignMission(missionId, {
        ambulance_id: ambulanceId,
        personnel_ids: personnelIds,
      });
      
      set((state) => ({
        missions: state.missions.map((mission) =>
          mission.id === missionId ? updatedMission : mission
        ),
      }));
      
      // Mettre à jour le statut de l'ambulance
      await get().updateAmbulanceStatus(ambulanceId, 'en_mission');
    } catch (error) {
      console.error('Error assigning mission:', error);
      throw error;
    }
  },

  updateMissionStatus: async (id, status) => {
    try {
      const updatedMission = await missionService.updateMissionStatus(id, status);
      set((state) => ({
        missions: state.missions.map((mission) =>
          mission.id === id ? updatedMission : mission
        ),
      }));

      // Si la mission est terminée, libérer l'ambulance
      if (status === 'terminee') {
        const mission = get().missions.find(m => m.id === id);
        if (mission?.ambulanceId) {
          await get().updateAmbulanceStatus(mission.ambulanceId, 'disponible');
        }
      }
    } catch (error) {
      console.error('Error updating mission status:', error);
      throw error;
    }
  },

  setSelectedMission: (mission) => {
    set({ selectedMission: mission });
  },

  // Actions Ambulances
  fetchAmbulances: async () => {
    set({ isLoading: true });
    try {
      const ambulances = await ambulanceService.getAmbulances();
      set({ ambulances, isLoading: false });
    } catch (error) {
      console.error('Error fetching ambulances:', error);
      set({ isLoading: false });
    }
  },

  addAmbulance: async (ambulanceData) => {
    try {
      const newAmbulance = await ambulanceService.createAmbulance(ambulanceData);
      set((state) => ({
        ambulances: [...state.ambulances, newAmbulance],
      }));
    } catch (error) {
      console.error('Error creating ambulance:', error);
      throw error;
    }
  },

  updateAmbulance: async (id, updates) => {
    try {
      const updatedAmbulance = await ambulanceService.updateAmbulance(id, updates);
      set((state) => ({
        ambulances: state.ambulances.map((ambulance) =>
          ambulance.id === id ? updatedAmbulance : ambulance
        ),
      }));
    } catch (error) {
      console.error('Error updating ambulance:', error);
      throw error;
    }
  },

  deleteAmbulance: async (id) => {
    try {
      await ambulanceService.deleteAmbulance(id);
      set((state) => ({
        ambulances: state.ambulances.filter((ambulance) => ambulance.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting ambulance:', error);
      throw error;
    }
  },

  updateAmbulanceStatus: async (id, status) => {
    try {
      const updatedAmbulance = await ambulanceService.updateAmbulanceStatus(id, status);
      set((state) => ({
        ambulances: state.ambulances.map((ambulance) =>
          ambulance.id === id ? updatedAmbulance : ambulance
        ),
      }));
    } catch (error) {
      console.error('Error updating ambulance status:', error);
      throw error;
    }
  },

  updateAmbulanceLocation: async (id, location) => {
    try {
      const updatedAmbulance = await ambulanceService.updateAmbulanceLocation(id, {
        latitude: location.lat,
        longitude: location.lng,
      });
      set((state) => ({
        ambulances: state.ambulances.map((ambulance) =>
          ambulance.id === id ? updatedAmbulance : ambulance
        ),
      }));
    } catch (error) {
      console.error('Error updating ambulance location:', error);
      throw error;
    }
  },

  // Actions Hôpitaux (données locales)
  addHospital: (hospitalData) => {
    const newHospital: Hospital = {
      ...hospitalData,
      id: Date.now().toString(),
    };
    set((state) => ({
      hospitals: [...state.hospitals, newHospital],
    }));
  },

  updateHospital: (id, updates) => {
    set((state) => ({
      hospitals: state.hospitals.map((hospital) =>
        hospital.id === id ? { ...hospital, ...updates } : hospital
      ),
    }));
  },

  deleteHospital: (id) => {
    set((state) => ({
      hospitals: state.hospitals.filter((hospital) => hospital.id !== id),
    }));
  },

  // Actions Personnel (données locales)
  addPersonnel: (personnelData) => {
    const newPersonnel: Personnel = {
      ...personnelData,
      id: Date.now().toString(),
    };
    set((state) => ({
      personnel: [...state.personnel, newPersonnel],
    }));
  },

  updatePersonnel: (id, updates) => {
    set((state) => ({
      personnel: state.personnel.map((person) =>
        person.id === id ? { ...person, ...updates } : person
      ),
    }));
  },

  deletePersonnel: (id) => {
    set((state) => ({
      personnel: state.personnel.filter((person) => person.id !== id),
    }));
  },

  // Actions Maintenance (données locales)
  addMaintenanceRecord: (recordData) => {
    const newRecord: MaintenanceRecord = {
      ...recordData,
      id: Date.now().toString(),
    };
    set((state) => ({
      maintenanceRecords: [...state.maintenanceRecords, newRecord],
    }));
  },

  updateMaintenanceRecord: (id, updates) => {
    set((state) => ({
      maintenanceRecords: state.maintenanceRecords.map((record) =>
        record.id === id ? { ...record, ...updates } : record
      ),
    }));
  },

  deleteMaintenanceRecord: (id) => {
    set((state) => ({
      maintenanceRecords: state.maintenanceRecords.filter((record) => record.id !== id),
    }));
  },

  // Actions Notifications (données locales)
  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ),
    }));
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },

  // Getters
  getAvailableAmbulances: () => {
    return get().ambulances.filter((ambulance) => ambulance.status === 'disponible');
  },

  getMissionsByStatus: (status) => {
    return get().missions.filter((mission) => mission.status === status);
  },

  getActiveMissions: () => {
    return get().missions.filter((mission) =>
      ['en_attente', 'assignee', 'en_cours'].includes(mission.status)
    );
  },
}));