import { create } from 'zustand';
import { Mission, Ambulance, Hospital, Personnel, MaintenanceRecord, Notification } from '../types';

interface MissionState {
  missions: Mission[];
  ambulances: Ambulance[];
  hospitals: Hospital[];
  personnel: Personnel[];
  maintenanceRecords: MaintenanceRecord[];
  notifications: Notification[];
  selectedMission: Mission | null;
  
  // Actions Missions
  addMission: (mission: Omit<Mission, 'id' | 'createdAt'>) => void;
  updateMission: (id: string, updates: Partial<Mission>) => void;
  deleteMission: (id: string) => void;
  assignMission: (missionId: string, ambulanceId: string, personnelIds: string[]) => void;
  updateMissionStatus: (id: string, status: Mission['status']) => void;
  setSelectedMission: (mission: Mission | null) => void;
  
  // Actions Ambulances
  addAmbulance: (ambulance: Omit<Ambulance, 'id'>) => void;
  updateAmbulance: (id: string, updates: Partial<Ambulance>) => void;
  deleteAmbulance: (id: string) => void;
  updateAmbulanceStatus: (id: string, status: Ambulance['status']) => void;
  updateAmbulanceLocation: (id: string, location: { lat: number; lng: number }) => void;
  
  // Actions Hôpitaux
  addHospital: (hospital: Omit<Hospital, 'id'>) => void;
  updateHospital: (id: string, updates: Partial<Hospital>) => void;
  deleteHospital: (id: string) => void;
  
  // Actions Personnel
  addPersonnel: (personnel: Omit<Personnel, 'id'>) => void;
  updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  deletePersonnel: (id: string) => void;
  
  // Actions Maintenance
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  updateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  deleteMaintenanceRecord: (id: string) => void;
  
  // Actions Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  
  // Getters
  getAvailableAmbulances: () => Ambulance[];
  getMissionsByStatus: (status: Mission['status']) => Mission[];
  getActiveMissions: () => Mission[];
}

// Données de démonstration étendues
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
  {
    id: '3',
    name: 'Hôpital Cochin',
    address: '27 Rue du Faubourg Saint-Jacques, 75014 Paris',
    phone: '+33158411234',
    email: 'contact@cochin.fr',
    location: { lat: 48.8387, lng: 2.3372 },
    availableBeds: { emergency: 18, icu: 10, general: 52 },
    specialties: ['Chirurgie', 'Maternité', 'Pédiatrie'],
    isActive: true,
  },
];

const demoAmbulances: Ambulance[] = [
  {
    id: '1',
    plateNumber: 'AMB-001',
    model: 'Mercedes Sprinter',
    capacity: 2,
    status: 'disponible',
    location: { lat: 48.8566, lng: 2.3522, lastUpdate: new Date() },
    assignedPersonnel: ['1', '2'],
    equipment: ['Défibrillateur', 'Respirateur', 'Brancard', 'Oxygène'],
    fuelLevel: 85,
    mileage: 45230,
  },
  {
    id: '2',
    plateNumber: 'AMB-002',
    model: 'Volkswagen Crafter',
    capacity: 2,
    status: 'en_mission',
    location: { lat: 48.8606, lng: 2.3376, lastUpdate: new Date() },
    assignedPersonnel: ['3', '4'],
    equipment: ['Défibrillateur', 'Respirateur', 'Brancard', 'Oxygène'],
    fuelLevel: 62,
    mileage: 38750,
  },
  {
    id: '3',
    plateNumber: 'AMB-003',
    model: 'Ford Transit',
    capacity: 1,
    status: 'maintenance',
    location: { lat: 48.8534, lng: 2.3488, lastUpdate: new Date() },
    assignedPersonnel: [],
    equipment: ['Défibrillateur', 'Brancard', 'Oxygène'],
    fuelLevel: 95,
    mileage: 52100,
  },
  {
    id: '4',
    plateNumber: 'AMB-004',
    model: 'Renault Master',
    capacity: 2,
    status: 'disponible',
    location: { lat: 48.8584, lng: 2.2945, lastUpdate: new Date() },
    assignedPersonnel: ['5', '6'],
    equipment: ['Défibrillateur', 'Respirateur', 'Brancard', 'Oxygène', 'Moniteur cardiaque'],
    fuelLevel: 78,
    mileage: 29800,
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
  {
    id: '3',
    userId: '5',
    firstName: 'Marc',
    lastName: 'Leroy',
    role: 'ambulancier',
    qualification: ['Ambulancier DE', 'Secourisme', 'Conduite d\'urgence'],
    phone: '+33123456793',
    email: 'marc.leroy@ambulance.com',
    status: 'en_service',
    currentShift: {
      start: new Date(2024, 0, 15, 8, 0),
      end: new Date(2024, 0, 15, 20, 0),
      type: 'jour',
    },
    assignedAmbulance: '2',
  },
  {
    id: '4',
    userId: '6',
    firstName: 'Julie',
    lastName: 'Bernard',
    role: 'paramedic',
    qualification: ['Paramédic', 'Réanimation', 'Soins intensifs'],
    phone: '+33123456794',
    email: 'julie.bernard@ambulance.com',
    status: 'en_service',
    currentShift: {
      start: new Date(2024, 0, 15, 8, 0),
      end: new Date(2024, 0, 15, 20, 0),
      type: 'jour',
    },
    assignedAmbulance: '2',
  },
  {
    id: '5',
    userId: '7',
    firstName: 'Thomas',
    lastName: 'Moreau',
    role: 'ambulancier',
    qualification: ['Ambulancier DE', 'Secourisme'],
    phone: '+33123456795',
    email: 'thomas.moreau@ambulance.com',
    status: 'disponible',
    assignedAmbulance: '4',
  },
  {
    id: '6',
    userId: '8',
    firstName: 'Emma',
    lastName: 'Rousseau',
    role: 'medecin',
    qualification: ['Médecin urgentiste', 'Réanimation', 'Cardiologie'],
    phone: '+33123456796',
    email: 'emma.rousseau@ambulance.com',
    status: 'repos',
  },
];

const demoMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    ambulanceId: '1',
    type: 'preventive',
    description: 'Révision générale et changement d\'huile',
    cost: 450,
    scheduledDate: new Date(2024, 0, 20),
    status: 'planifiee',
    technician: 'Jean Dupont',
    parts: ['Huile moteur', 'Filtre à huile', 'Filtre à air'],
    notes: 'Révision des 50 000 km',
  },
  {
    id: '2',
    ambulanceId: '2',
    type: 'corrective',
    description: 'Réparation du système de freinage',
    cost: 680,
    scheduledDate: new Date(2024, 0, 18),
    completedDate: new Date(2024, 0, 18),
    status: 'terminee',
    technician: 'Marie Leroy',
    parts: ['Plaquettes de frein', 'Disques de frein'],
    notes: 'Usure prématurée détectée lors du contrôle',
  },
  {
    id: '3',
    ambulanceId: '3',
    type: 'urgente',
    description: 'Panne du défibrillateur',
    cost: 1200,
    scheduledDate: new Date(2024, 0, 16),
    status: 'en_cours',
    technician: 'Paul Martin',
    parts: ['Module électronique', 'Électrodes'],
    notes: 'Remplacement du module défaillant',
  },
];

const demoNotifications: Notification[] = [
  {
    id: '1',
    type: 'mission',
    title: 'Nouvelle mission critique',
    message: 'Mission critique assignée - Patient en détresse respiratoire',
    priority: 'critical',
    role: 'ambulancier',
    isRead: false,
    createdAt: new Date(2024, 0, 15, 14, 30),
    actionUrl: '/missions',
  },
  {
    id: '2',
    type: 'maintenance',
    title: 'Maintenance programmée',
    message: 'Révision de l\'ambulance AMB-001 prévue demain',
    priority: 'medium',
    role: 'admin',
    isRead: false,
    createdAt: new Date(2024, 0, 15, 10, 15),
  },
  {
    id: '3',
    type: 'system',
    title: 'Mise à jour système',
    message: 'Le système a été mis à jour avec succès',
    priority: 'low',
    isRead: true,
    createdAt: new Date(2024, 0, 15, 8, 0),
  },
  {
    id: '4',
    type: 'emergency',
    title: 'Ambulance en panne',
    message: 'AMB-003 signale une panne technique',
    priority: 'high',
    role: 'regulateur',
    isRead: false,
    createdAt: new Date(2024, 0, 15, 13, 45),
  },
];

const demoMissions: Mission[] = [
  {
    id: '1',
    patientName: 'Jean Dupont',
    patientPhone: '+33123456789',
    patientAge: 65,
    patientCondition: 'Douleur thoracique',
    priority: 'critique',
    status: 'en_cours',
    pickupLocation: {
      address: '15 Rue de Rivoli, 75001 Paris',
      lat: 48.8566,
      lng: 2.3522,
    },
    destination: {
      hospitalId: '1',
      hospitalName: 'CHU de Paris',
      address: '47-83 Boulevard de l\'Hôpital, 75013 Paris',
      lat: 48.8388,
      lng: 2.3619,
    },
    ambulanceId: '2',
    assignedPersonnel: ['3', '4'],
    createdAt: new Date(2024, 0, 15, 14, 30),
    assignedAt: new Date(2024, 0, 15, 14, 32),
    startedAt: new Date(2024, 0, 15, 14, 35),
    estimatedDuration: 25,
    notes: 'Patient conscient, douleur intense',
    symptoms: ['Douleur thoracique', 'Essoufflement', 'Sueurs'],
  },
  {
    id: '2',
    patientName: 'Marie Leroy',
    patientPhone: '+33123456790',
    patientAge: 34,
    patientCondition: 'Fracture du bras',
    priority: 'normale',
    status: 'en_attente',
    pickupLocation: {
      address: '28 Avenue des Champs-Élysées, 75008 Paris',
      lat: 48.8698,
      lng: 2.3076,
    },
    destination: {
      hospitalId: '2',
      hospitalName: 'Hôpital Saint-Louis',
      address: '1 Avenue Claude Vellefaux, 75010 Paris',
      lat: 48.8719,
      lng: 2.3698,
    },
    assignedPersonnel: [],
    createdAt: new Date(2024, 0, 15, 15, 15),
    estimatedDuration: 20,
    notes: 'Chute à vélo, patient stable',
    symptoms: ['Douleur au bras', 'Déformation visible'],
  },
  {
    id: '3',
    patientName: 'Paul Bernard',
    patientPhone: '+33123456791',
    patientAge: 78,
    patientCondition: 'Malaise général',
    priority: 'urgente',
    status: 'terminee',
    pickupLocation: {
      address: '12 Place de la Bastille, 75011 Paris',
      lat: 48.8532,
      lng: 2.3692,
    },
    destination: {
      hospitalId: '1',
      hospitalName: 'CHU de Paris',
      address: '47-83 Boulevard de l\'Hôpital, 75013 Paris',
      lat: 48.8388,
      lng: 2.3619,
    },
    ambulanceId: '1',
    assignedPersonnel: ['1', '2'],
    createdAt: new Date(2024, 0, 15, 13, 0),
    assignedAt: new Date(2024, 0, 15, 13, 2),
    startedAt: new Date(2024, 0, 15, 13, 8),
    completedAt: new Date(2024, 0, 15, 13, 45),
    estimatedDuration: 30,
    actualDuration: 37,
    notes: 'Transport effectué sans complications',
    symptoms: ['Faiblesse', 'Vertiges', 'Nausées'],
  },
];

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: demoMissions,
  ambulances: demoAmbulances,
  hospitals: demoHospitals,
  personnel: demoPersonnel,
  maintenanceRecords: demoMaintenanceRecords,
  notifications: demoNotifications,
  selectedMission: null,

  // Actions Missions
  addMission: (missionData) => {
    const newMission: Mission = {
      ...missionData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
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
  },

  updateMission: (id, updates) => {
    set((state) => ({
      missions: state.missions.map((mission) =>
        mission.id === id ? { ...mission, ...updates } : mission
      ),
    }));
  },

  deleteMission: (id) => {
    set((state) => ({
      missions: state.missions.filter((mission) => mission.id !== id),
    }));
  },

  assignMission: (missionId, ambulanceId, personnelIds) => {
    const now = new Date();
    set((state) => ({
      missions: state.missions.map((mission) =>
        mission.id === missionId
          ? {
              ...mission,
              ambulanceId,
              assignedPersonnel: personnelIds,
              status: 'assignee' as const,
              assignedAt: now,
            }
          : mission
      ),
      ambulances: state.ambulances.map((ambulance) =>
        ambulance.id === ambulanceId
          ? { ...ambulance, status: 'en_mission' as const }
          : ambulance
      ),
      personnel: state.personnel.map((person) =>
        personnelIds.includes(person.id)
          ? { ...person, status: 'en_service' as const, assignedAmbulance: ambulanceId }
          : person
      ),
    }));
    
    // Ajouter une notification pour l'assignation
    const { addNotification } = get();
    const mission = get().missions.find(m => m.id === missionId);
    if (mission) {
      addNotification({
        type: 'mission',
        title: 'Mission assignée',
        message: `Mission pour ${mission.patientName} assignée avec succès`,
        priority: 'medium',
        role: 'ambulancier',
        actionUrl: '/missions',
        isRead: false
      });
    }
  },

  updateMissionStatus: (id, status) => {
    const now = new Date();
    set((state) => ({
      missions: state.missions.map((mission) => {
        if (mission.id === id) {
          const updates: Partial<Mission> = { status };
          
          if (status === 'en_cours' && !mission.startedAt) {
            updates.startedAt = now;
          } else if (status === 'terminee' && !mission.completedAt) {
            updates.completedAt = now;
            if (mission.startedAt) {
              updates.actualDuration = Math.round(
                (now.getTime() - mission.startedAt.getTime()) / (1000 * 60)
              );
            }
          }
          
          return { ...mission, ...updates };
        }
        return mission;
      }),
    }));

    if (status === 'terminee') {
      const mission = get().missions.find(m => m.id === id);
      if (mission?.ambulanceId) {
        get().updateAmbulanceStatus(mission.ambulanceId, 'disponible');
      }
    }
  },

  setSelectedMission: (mission) => {
    set({ selectedMission: mission });
  },

  // Actions Ambulances
  addAmbulance: (ambulanceData) => {
    const newAmbulance: Ambulance = {
      ...ambulanceData,
      id: Date.now().toString(),
    };
    set((state) => ({
      ambulances: [...state.ambulances, newAmbulance],
    }));
  },

  updateAmbulance: (id, updates) => {
    set((state) => ({
      ambulances: state.ambulances.map((ambulance) =>
        ambulance.id === id ? { ...ambulance, ...updates } : ambulance
      ),
    }));
  },

  deleteAmbulance: (id) => {
    set((state) => ({
      ambulances: state.ambulances.filter((ambulance) => ambulance.id !== id),
    }));
  },

  updateAmbulanceStatus: (id, status) => {
    set((state) => ({
      ambulances: state.ambulances.map((ambulance) =>
        ambulance.id === id ? { ...ambulance, status } : ambulance
      ),
    }));
  },

  updateAmbulanceLocation: (id, location) => {
    set((state) => ({
      ambulances: state.ambulances.map((ambulance) =>
        ambulance.id === id
          ? {
              ...ambulance,
              location: { ...location, lastUpdate: new Date() },
            }
          : ambulance
      ),
    }));
  },

  // Actions Hôpitaux
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

  // Actions Personnel
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

  // Actions Maintenance
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

  // Actions Notifications
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