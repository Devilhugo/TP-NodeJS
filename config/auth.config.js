if (!process.env.JWT_SECRET) {
  throw new Error("La variable d'environnement JWT_SECRET n'est pas définie.");
}

module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
