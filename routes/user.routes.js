const { authJwt } = require('../middleware');
const controller = require('../controllers/user.controller');

module.exports = (app) => {
  app.get('/api/test/all', controller.allAccess);

  app.get('/api/test/user', [authJwt.verifyToken], controller.userBoard);

  // Question 9 : isModeratorOrAdmin pour que l'admin accède aussi à cette route
  app.get(
    '/api/test/mod',
    [authJwt.verifyToken, authJwt.isModeratorOrAdmin],
    controller.moderatorBoard
  );

  app.get(
    '/api/test/admin',
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );
};
