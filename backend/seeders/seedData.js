const { User, Ambulance, Hospital, Mission } = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Début du seeding des données...');

    // Créer les utilisateurs
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@ambulance.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'Système',
        phone: '+33123456789',
        role: 'admin',
        isActive: true
      },
      {
        username: 'regulateur',
        email: 'regulateur@ambulance.com',
        password: 'demo123',
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '+33123456790',
        role: 'regulateur',
        isActive: true
      },
      {
        username: 'ambulancier',
        email: 'ambulancier@ambulance.com',
        password: 'demo123',
        firstName: 'Pierre',
        lastName: 'Martin',
        phone: '+33123456791',
        role: 'ambulancier',
        isActive: true
      }
    ], { individualHooks: true });

    console.log('✅ Utilisateurs créés');

    // Créer les hôpitaux
    const hospitals = await Hospital.bulkCreate([
      {
        name: 'CHU de Paris',
        address: '47-83 Boulevard de l\'Hôpital, 75013 Paris',
        phone: '+33142161000',
        email: 'contact@chu-paris.fr',
        latitude: 48.8388,
        longitude: 2.3619,
        emergencyBeds: 15,
        icuBeds: 8,
        generalBeds: 45,
        specialties: ['Cardiologie', 'Neurologie', 'Urgences', 'Réanimation'],
        isActive: true
      },
      {
        name: 'Hôpital Saint-Louis',
        address: '1 Avenue Claude Vellefaux, 75010 Paris',
        phone: '+33142499000',
        email: 'contact@saint-louis.fr',
        latitude: 48.8719,
        longitude: 2.3698,
        emergencyBeds: 12,
        icuBeds: 6,
        generalBeds: 38,
        specialties: ['Hématologie', 'Oncologie', 'Dermatologie'],
        isActive: true
      }
    ]);

    console.log('✅ Hôpitaux créés');

    // Créer les ambulances
    const ambulances = await Ambulance.bulkCreate([
      {
        plateNumber: 'AMB-001',
        model: 'Mercedes Sprinter',
        capacity: 2,
        status: 'disponible',
        latitude: 48.8566,
        longitude: 2.3522,
        locationUpdatedAt: new Date(),
        equipment: ['Défibrillateur', 'Respirateur', 'Brancard', 'Oxygène'],
        fuelLevel: 85,
        mileage: 45230
      },
      {
        plateNumber: 'AMB-002',
        model: 'Volkswagen Crafter',
        capacity: 2,
        status: 'en_mission',
        latitude: 48.8606,
        longitude: 2.3376,
        locationUpdatedAt: new Date(),
        equipment: ['Défibrillateur', 'Respirateur', 'Brancard', 'Oxygène'],
        fuelLevel: 62,
        mileage: 38750
      },
      {
        plateNumber: 'AMB-003',
        model: 'Ford Transit',
        capacity: 1,
        status: 'maintenance',
        latitude: 48.8534,
        longitude: 2.3488,
        locationUpdatedAt: new Date(),
        equipment: ['Défibrillateur', 'Brancard', 'Oxygène'],
        fuelLevel: 95,
        mileage: 52100
      }
    ]);

    console.log('✅ Ambulances créées');

    // Créer les missions
    const missions = await Mission.bulkCreate([
      {
        patientName: 'Jean Dupont',
        patientPhone: '+33123456789',
        patientAge: 65,
        patientCondition: 'Douleur thoracique',
        priority: 'urgente',
        status: 'en_attente',
        pickupAddress: '15 Rue de Rivoli, 75001 Paris',
        pickupLatitude: 48.8566,
        pickupLongitude: 2.3522,
        hospitalId: hospitals[0].id,
        estimatedDuration: 30,
        symptoms: ['Douleur thoracique', 'Essoufflement'],
        notes: 'Patient conscient, douleur intense'
      },
      {
        patientName: 'Marie Martin',
        patientPhone: '+33123456790',
        patientAge: 45,
        patientCondition: 'Fracture du bras',
        priority: 'normale',
        status: 'assignee',
        pickupAddress: '25 Avenue des Champs-Élysées, 75008 Paris',
        pickupLatitude: 48.8698,
        pickupLongitude: 2.3076,
        hospitalId: hospitals[1].id,
        ambulanceId: ambulances[1].id,
        assignedPersonnel: [users[2].id.toString()],
        assignedAt: new Date(Date.now() - 1800000), // 30 min avant
        estimatedDuration: 25,
        symptoms: ['Douleur au bras', 'Gonflement'],
        notes: 'Chute à domicile'
      }
    ]);

    console.log('✅ Missions créées');
    console.log('🎉 Seeding terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  }
};

module.exports = seedData;