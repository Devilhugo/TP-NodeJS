const BlogPost = require('../models/BlogPost.js');

module.exports = async (req, res) => {
  try {
    const blogposts = await BlogPost.findAll();
    res.render('index', { blogposts });
  } catch (error) {
    console.error('Erreur liste des posts :', error);
    res.status(500).send('Erreur serveur');
  }
};
