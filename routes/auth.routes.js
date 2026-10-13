const { verifySignUp } = require('../middleware');
const controller = require('../controllers/auth.controller');

module.exports = (app) => {
  app.post(
    '/api/auth/signup',
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    controller.signup
  );

  app.post('/api/auth/signin', controller.signin);
};
