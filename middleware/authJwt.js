const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const db = require('../models');
const User = db.user;

// Récupère le jeton dans x-access-token ou dans Authorization: Bearer <jeton>
const getToken = (req) => {
  const header = req.headers['authorization'];
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return req.headers['x-access-token'];
};

const verifyToken = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).send({ message: 'Aucun jeton fourni.' });
  }

  jwt.verify(token, config.secret, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Jeton invalide ou expiré.' });
    }
    req.userId = decoded.id;
    next();
  });
};

// Fabrique un middleware qui exige au moins un des rôles indiqués
const requireRole = (...allowed) => async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).send({ message: 'Utilisateur introuvable.' });
    }

    const roles = await user.getRoles();
    if (roles.some((role) => allowed.includes(role.name))) {
      return next();
    }

    res.status(403).send({
      message: `Rôle requis : ${allowed.join(' ou ')}.`
    });
  } catch (err) {
    next(err); // Express 4 : erreur transmise au gestionnaire d'erreurs
  }
};

module.exports = {
  verifyToken,
  isAdmin: requireRole('admin'),
  isModerator: requireRole('moderator'),
  isModeratorOrAdmin: requireRole('moderator', 'admin')
};
