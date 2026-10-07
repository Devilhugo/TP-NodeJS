// Crée les tables : npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./index');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Tables créées (users, blogposts, session).');
  } catch (error) {
    console.error('Erreur lors de la création des tables :', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
