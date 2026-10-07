const path = require('path');
const sanitizeHtml = require('sanitize-html');
const BlogPost = require('../models/BlogPost.js');

module.exports = async (req, res) => {
  try {
    const image = req.files.image;

    if (!image.mimetype.startsWith('image/')) {
      return res.redirect('/posts/new');
    }

    // Nom de fichier unique, sans chemin (évite les "../")
    const fileName = Date.now() + '-' + path.basename(image.name);
    await image.mv(path.resolve(__dirname, '..', 'public/images', fileName));

    await BlogPost.create({
      title: req.body.title,
      body: sanitizeHtml(req.body.body || ''), // le HTML de Summernote est nettoyé (anti-XSS)
      image: '/images/' + fileName,
      userid: req.session.userId
    });

    res.redirect('/');
  } catch (error) {
    console.error('Erreur création post :', error);
    res.redirect('/posts/new');
  }
};
