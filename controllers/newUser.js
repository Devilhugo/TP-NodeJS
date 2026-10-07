module.exports = (req, res) => {
  const data = req.flash('data')[0];

  res.render('register', {
    errors: req.flash('validationErrors'),
    username: data ? data.username : ''
  });
};
