exports.allAccess = (req, res) => {
  res.status(200).send('Contenu public.');
};

exports.userBoard = (req, res) => {
  res.status(200).send('Contenu utilisateur.');
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send('Contenu modérateur.');
};

exports.adminBoard = (req, res) => {
  res.status(200).send('Contenu administrateur.');
};
