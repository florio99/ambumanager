const bcrypt = require('bcryptjs');

// Données de démonstration
let users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@ambulance.com',
    password: bcrypt.hashSync('admin123', 10),
    firstName: 'Admin',
    lastName: 'Système',
    phone: '+33123456789',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    id: '2',
    username: 'regulateur',
    email: 'regulateur@ambulance.com',
    password: bcrypt.hashSync('demo123', 10),
    firstName: 'Marie',
    lastName: 'Dupont',
    phone: '+33123456790',
    role: 'regulateur',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    id: '3',
    username: 'ambulancier',
    email: 'ambulancier@ambulance.com',
    password: bcrypt.hashSync('demo123', 10),
    firstName: 'Pierre',
    lastName: 'Martin',
    phone: '+33123456791',
    role: 'ambulancier',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  }
];

let ambulances = [
  {
    id: '1',
    plate_number: 'AMB-001',
    model: 'Mercedes Sprinter',
    capacity: 2,
    status: 'disponible',
    latitude: 48.8566,
    longitude: 2.3522,
    location_updated_at: new Date(),
    equipment: ['Défibrillateur', 'Respirateur', 'Brancard', 'Oxygène'],
    fuel_level: 85,
    mileage: 45230,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    plate_number: 'AMB-002',
    model: 'Volkswagen Crafter',
    capacity: 2,
    status: 'en_mission',
    latitude: 48.8606,
    longitude: 2.3376,
    location_updated_at: new Date(),
    equipment: ['Défibrillateur', 'Respirateur', 'Brancard', 'Oxygène'],
    fuel_level: 62,
    mileage: 38750,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '3',
    plate_number: 'AMB-003',
    model: 'Ford Transit',
    capacity: 1,
    status: 'maintenance',
    latitude: 48.8534,
    longitude: 2.3488,
    location_updated_at: new Date(),
    equipment: ['Défibrillateur', 'Brancard', 'Oxygène'],
    fuel_level: 95,
    mileage: 52100,
    created_at: new Date(),
    updated_at: new Date()
  }
];

let missions = [
  {
    id: '1',
    patient_name: 'Jean Dupont',
    patient_phone: '+33123456789',
    patient_age: 65,
    patient_condition: 'Douleur thoracique',
    priority: 'urgente',
    status: 'en_attente',
    pickup_address: '15 Rue de Rivoli, 75001 Paris',
    pickup_latitude: 48.8566,
    pickup_longitude: 2.3522,
    hospital_id: '1',
    ambulance_id: null,
    assigned_personnel: [],
    estimated_duration: 30,
    actual_duration: null,
    symptoms: ['Douleur thoracique', 'Essoufflement'],
    notes: 'Patient conscient, douleur intense',
    created_at: new Date(),
    assigned_at: null,
    started_at: null,
    completed_at: null
  },
  {
    id: '2',
    patient_name: 'Marie Martin',
    patient_phone: '+33123456790',
    patient_age: 45,
    patient_condition: 'Fracture du bras',
    priority: 'normale',
    status: 'assignee',
    pickup_address: '25 Avenue des Champs-Élysées, 75008 Paris',
    pickup_latitude: 48.8698,
    pickup_longitude: 2.3076,
    hospital_id: '2',
    ambulance_id: '2',
    assigned_personnel: ['1', '2'],
    estimated_duration: 25,
    actual_duration: null,
    symptoms: ['Douleur au bras', 'Gonflement'],
    notes: 'Chute à domicile',
    created_at: new Date(Date.now() - 3600000), // 1 heure avant
    assigned_at: new Date(Date.now() - 1800000), // 30 min avant
    started_at: null,
    completed_at: null
  }
];

let hospitals = [
  {
    id: '1',
    name: 'CHU de Paris',
    address: '47-83 Boulevard de l\'Hôpital, 75013 Paris',
    phone: '+33142161000',
    email: 'contact@chu-paris.fr',
    latitude: 48.8388,
    longitude: 2.3619,
    emergency_beds: 15,
    icu_beds: 8,
    general_beds: 45,
    specialties: ['Cardiologie', 'Neurologie', 'Urgences', 'Réanimation'],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    name: 'Hôpital Saint-Louis',
    address: '1 Avenue Claude Vellefaux, 75010 Paris',
    phone: '+33142499000',
    email: 'contact@saint-louis.fr',
    latitude: 48.8719,
    longitude: 2.3698,
    emergency_beds: 12,
    icu_beds: 6,
    general_beds: 38,
    specialties: ['Hématologie', 'Oncologie', 'Dermatologie'],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  users,
  ambulances,
  missions,
  hospitals
};