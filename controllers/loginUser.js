const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    const username = String(req.body.username || '');
    const password = String(req.body.password || '');

    const user = await User.findOne({ username: username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/auth/login');
    }

    // Nouvel identifiant de session à la connexion (anti fixation de session)
    req.session.regenerate((err) => {
      if (err) return res.redirect('/auth/login');
      req.session.userId = user._id;
      res.redirect('/');
    });
  } catch (error) {
    console.error('Erreur login :', error);
    res.redirect('/auth/login');
  }
};
