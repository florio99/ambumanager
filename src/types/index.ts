export interface User {
  id: string;
  username: string;
  role: 'admin' | 'regulateur' | 'ambulancier';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  lastLogin?: Date;
}

export interface Ambulance {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'disponible' | 'en_mission' | 'en_panne' | 'maintenance';
  location: {
    lat: number;
    lng: number;
    lastUpdate: Date;
  };
  assignedPersonnel: string[];
  equipment: string[];
  fuelLevel: number;
  mileage: number;
}

export interface Mission {
  id: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientCondition: string;
  priority: 'critique' | 'urgente' | 'normale' | 'faible';
  status: 'en_attente' | 'assignee' | 'en_cours' | 'terminee' | 'annulee';
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    hospitalId: string;
    hospitalName: string;
    address: string;
    lat: number;
    lng: number;
  };
  ambulanceId?: string;
  assignedPersonnel: string[];
  createdAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  notes: string;
  symptoms: string[];
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  location: {
    lat: number;
    lng: number;
  };
  availableBeds: {
    emergency: number;
    icu: number;
    general: number;
  };
  specialties: string[];
  isActive: boolean;
}

export interface Personnel {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  role: 'ambulancier' | 'paramedic' | 'medecin' | 'regulateur';
  qualification: string[];
  phone: string;
  email: string;
  status: 'disponible' | 'en_service' | 'repos' | 'conge';
  currentShift?: {
    start: Date;
    end: Date;
    type: 'jour' | 'nuit' | 'weekend';
  };
  assignedAmbulance?: string;
}

export interface MaintenanceRecord {
  id: string;
  ambulanceId: string;
  type: 'preventive' | 'corrective' | 'urgente';
  description: string;
  cost: number;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'planifiee' | 'en_cours' | 'terminee' | 'reportee';
  technician: string;
  parts: string[];
  notes: string;
}

export interface Report {
  id: string;
  type: 'mission' | 'vehicle' | 'personnel' | 'financial';
  title: string;
  period: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedBy: string;
  generatedAt: Date;
}

export interface Notification {
  id: string;
  type: 'mission' | 'emergency' | 'maintenance' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  role?: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}