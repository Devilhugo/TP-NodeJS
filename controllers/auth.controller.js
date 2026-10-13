const db = require('../models');
const config = require('../config/auth.config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;

exports.signup = async (req, res) => {
  try {
    // Enregistre l'utilisateur avec un mot de passe haché
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10)
    });

    if (req.body.roles && req.body.roles.length > 0) {
      const roles = await Role.findAll({
        where: { name: { [Op.in]: req.body.roles } }
      });
      await user.setRoles(roles);
    } else {
      await user.setRoles([1]); // rôle « user » par défaut
    }

    res.status(201).send({ message: "L'utilisateur est enregistré." });
  } catch (err) {
    // Données refusées par le modèle (email invalide…) : erreur du client
    const status = err.name === 'SequelizeValidationError' ? 400 : 500;
    res.status(status).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: String(req.body.username || '') }
    });

    if (!user) {
      return res.status(404).send({ message: 'Utilisateur non trouvé.' });
    }

    const passwordIsValid = await bcrypt.compare(
      String(req.body.password || ''),
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Mot de passe incorrect.'
      });
    }

    const token = jwt.sign({ id: user.id }, config.secret, {
      algorithm: 'HS256',
      expiresIn: config.expiresIn
    });

    const roles = await user.getRoles();

    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: roles.map((role) => 'ROLE_' + role.name.toUpperCase()),
      accessToken: token
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
