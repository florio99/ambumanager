const { sequelize } = require('../models');
const seedData = require('../seeders/seedData');

const seed = async () => {
  try {
    // Vérifier la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');

    // Exécuter le seeding
    await seedData();
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;