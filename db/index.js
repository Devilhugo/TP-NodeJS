const { Pool } = require('pg');

// DATABASE_URL (Neon, Supabase...) ou NETLIFY_DATABASE_URL (Netlify DB), sinon base locale
const connectionString =
  process.env.DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL ||
  'postgresql://postgres:postgres@127.0.0.1:5432/newblog';

const isLocal = /@(localhost|127\.0\.0\.1)(:|\/)/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : true, // SSL obligatoire pour une base en ligne
  max: 3                       // peu de connexions : chaque fonction serverless a son pool
});

pool.on('error', (err) => console.error('Erreur PostgreSQL :', err.message));

module.exports = pool;
