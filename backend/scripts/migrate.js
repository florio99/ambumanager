const { sequelize } = require('../models');

const migrate = async () => {
  try {
    console.log('🔄 Synchronisation des modèles avec la base de données...');
    
    // Synchroniser tous les modèles avec la base de données
    await sequelize.sync({ force: false, alter: true });
    
    console.log('✅ Synchronisation terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  migrate();
}

module.exports = migrate;