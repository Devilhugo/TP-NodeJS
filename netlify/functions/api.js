const serverless = require('serverless-http');
const app = require('../../app');

module.exports.handler = serverless(app, {
  // Les images servies par /image/:id sont du binaire : il faut les encoder en base64
  binary: ['image/*'],
  // Retire le préfixe /.netlify/functions/api ajouté par la redirection
  request(req) {
    let url = req.url.replace(/^\/\.netlify\/functions\/api/, '');
    if (!url.startsWith('/')) url = '/' + url;
    req.url = url;
  }
});
