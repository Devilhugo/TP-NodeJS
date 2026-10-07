const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    await User.create({
      username: req.body.username,
      password: req.body.password
    });
    res.redirect('/');
  } catch (error) {
    if (!error.validationErrors) console.error('Erreur inscription :', error);
    const validationErrors = error.validationErrors || ['Une erreur est survenue, veuillez réessayer.'];

    req.flash('validationErrors', validationErrors);
    req.flash('data', { username: req.body.username });
    res.redirect('/auth/register');
  }
};
