// Modèles Sequelize utilisés par l'API JWT (même base PostgreSQL que le blog)
const config = require('../config/db.config');
const Sequelize = require('sequelize');

// Connexion à la base de données
const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  dialectModule: require('pg'), // chargement explicite du pilote (bundle Netlify)
  dialectOptions: config.ssl ? { ssl: { require: true } } : {},
  logging: false, // mettre console.log pour voir les requêtes SQL
  pool: config.pool
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modèles (tables)
db.user = require('./user.model.js')(sequelize, Sequelize);
db.role = require('./role.model.js')(sequelize, Sequelize);

// Relation plusieurs-à-plusieurs entre rôles et utilisateurs
db.role.belongsToMany(db.user, {
  through: 'user_roles',
  foreignKey: 'roleId',
  otherKey: 'userId'
});
db.user.belongsToMany(db.role, {
  through: 'user_roles',
  foreignKey: 'userId',
  otherKey: 'roleId'
});

db.ROLES = ['user', 'admin', 'moderator'];

// Crée les 3 rôles s'ils n'existent pas encore
db.initRoles = () => db.role.bulkCreate(
  [
    { id: 1, name: 'user' },
    { id: 2, name: 'moderator' },
    { id: 3, name: 'admin' }
  ],
  { ignoreDuplicates: true }
);

module.exports = db;
