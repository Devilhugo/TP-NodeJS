// Connexion PostgreSQL partagée par le blog (pg) et l'API JWT (Sequelize)
// Connexion fournie uniquement par les variables d’environnement
const variableName = process.env.DATABASE_URL ? 'DATABASE_URL' : 'NETLIFY_DATABASE_URL';
const url = process.env[variableName];

if (!url) {
  throw new Error("La variable d'environnement DATABASE_URL ou NETLIFY_DATABASE_URL n'est pas définie.");
}

let connectionUrl;
try {
  connectionUrl = new URL(url);
} catch {
  throw new Error(`${variableName} doit contenir une chaîne de connexion PostgreSQL valide. La valeur n'est pas affichée pour protéger les identifiants.`);
}

if (!['postgres:', 'postgresql:'].includes(connectionUrl.protocol) || !connectionUrl.hostname) {
  throw new Error(`${variableName} doit utiliser le protocole postgres:// ou postgresql://, et non une URL HTTP(S) de console ou d'API. Configurer la chaîne de connexion PostgreSQL dans les variables d'environnement Netlify disponibles pour les Functions.`);
}

const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(connectionUrl.hostname);

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
