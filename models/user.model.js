// Table "users" du blog (créée par db/schema.sql), à laquelle on a ajouté "email"
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('users', {
    username: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: Sequelize.STRING(100),
      allowNull: false
    }
  }, {
    // La table existante a une colonne created_at et pas de updatedAt
    createdAt: 'created_at',
    updatedAt: false
  });

  return User;
};
