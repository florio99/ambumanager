const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabase = async () => {
  try {
    console.log('🔧 Création de la base de données...');

    // Connexion sans spécifier de base de données
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    // Créer la base de données si elle n'existe pas
    const dbName = process.env.DB_NAME || 'ambulance_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    console.log(`✅ Base de données '${dbName}' créée ou existe déjà`);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Erreur lors de la création de la base de données:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  createDatabase();
}

module.exports = createDatabase;