const { Pool } = require('pg');
const config = require('../config/db.config');

const pool = new Pool({
  connectionString: config.url,
  ssl: config.ssl,
  max: config.pool.max
});

pool.on('error', (err) => console.error('Erreur PostgreSQL :', err.message));

module.exports = pool;
