const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    const user = await User.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/auth/login');
    }

    // Nouvel identifiant de session à la connexion (anti fixation de session)
    req.session.regenerate((err) => {
      if (err) return res.redirect('/auth/login');
      req.session.userId = user.id;
      req.session.save(() => res.redirect('/'));
    });
  } catch (error) {
    console.error('Erreur login :', error);
    res.redirect('/auth/login');
  }
};
