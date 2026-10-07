const User = require('../models/User');

module.exports = async (req, res, next) => {
  // Pas de session -> inutile d'interroger la base
  if (!req.session.userId) return res.redirect('/auth/login');

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/auth/login');
    next();
  } catch (error) {
    return res.redirect('/auth/login');
  }
};
