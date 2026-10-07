const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    await User.create({
      username: req.body.username,
      password: req.body.password
    });
    res.redirect('/');
  } catch (error) {
    const validationErrors = error.errors
      ? Object.keys(error.errors).map(key => error.errors[key].message)
      : ['Une erreur est survenue, veuillez réessayer.'];

    req.flash('validationErrors', validationErrors);
    req.flash('data', req.body);
    res.redirect('/auth/register');
  }
};
