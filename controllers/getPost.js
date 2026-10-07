const BlogPost = require('../models/BlogPost.js');

module.exports = async (req, res) => {
  try {
    const blogposts = await BlogPost.findById(req.params.id);
    if (!blogposts) return res.status(404).render('notfound');
    res.render('post', { blogposts });
  } catch (error) {
    console.error('Erreur lecture post :', error);
    res.status(404).render('notfound');
  }
};
