const sanitizeHtml = require('sanitize-html');
const BlogPost = require('../models/BlogPost.js');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

module.exports = async (req, res) => {
  try {
    const image = req.files.image;

    // Pas de SVG ni d'autre type : seulement des images "classiques"
    if (!ALLOWED_TYPES.includes(image.mimetype)) {
      return res.redirect('/posts/new');
    }

    await BlogPost.create({
      title: String(req.body.title).trim(),
      body: sanitizeHtml(req.body.body || ''), // anti-XSS
      imageData: image.data,
      imageType: image.mimetype,
      userId: req.session.userId
    });

    res.redirect('/');
  } catch (error) {
    console.error('Erreur création post :', error);
    res.redirect('/posts/new');
  }
};
