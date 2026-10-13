// Crée les tables : npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./index');
const db = require('../models');

(async () => {
  try {
    // Tables du blog (users, blogposts, session) + colonne email
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);

    // Tables de l'API JWT (roles, user_roles), sans effacer les données
    await db.sequelize.sync();
    await db.initRoles();

    console.log('Tables créées (users, blogposts, session, roles, user_roles).');
  } catch (error) {
    console.error('Erreur lors de la création des tables :', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
    await db.sequelize.close();
  }
})();
