const db = require('../models');
const ROLES = db.ROLES;
const User = db.user;

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send({
      message: "Le nom d'utilisateur, l'email et le mot de passe sont requis."
    });
  }

  // Express 4 ne transmet pas les erreurs async : on les passe à next()
  try {
    // Nom d'utilisateur déjà pris ?
    if (await User.findOne({ where: { username } })) {
      return res.status(400).send({
        message: "Erreur : ce nom d'utilisateur est déjà utilisé."
      });
    }

    // Email déjà utilisé ?
    if (await User.findOne({ where: { email } })) {
      return res.status(400).send({
        message: 'Erreur : cet email est déjà utilisé.'
      });
    }
  } catch (err) {
    return next(err);
  }

  next();
};

const checkRolesExisted = (req, res, next) => {
  const roles = req.body.roles || [];

  for (const role of roles) {
    if (!ROLES.includes(role)) {
      return res.status(400).send({
        message: `Erreur : le rôle « ${role} » n'existe pas.`
      });
    }
  }

  next();
};

module.exports = { checkDuplicateUsernameOrEmail, checkRolesExisted };
