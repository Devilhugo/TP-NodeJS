// Connexion PostgreSQL partagée par le blog (pg) et l'API JWT (Sequelize)
// Connexion fournie uniquement par les variables d’environnement
const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!url) {
  throw new Error("La variable d'environnement DATABASE_URL ou NETLIFY_DATABASE_URL n'est pas définie.");
}

const isLocal = /@(localhost|127\.0\.0\.1)(:|\/)/.test(url);

module.exports = {
  url,
  ssl: !isLocal, // SSL obligatoire pour une base en ligne
  dialect: 'postgres',
  pool: {
    max: 3,         // peu de connexions : chaque fonction serverless a son pool
    min: 0,         // nombre minimal de connexions
    acquire: 30000, // délai maximal (ms) pour obtenir une connexion
    idle: 10000     // délai (ms) avant de libérer une connexion inutilisée
  }
};
