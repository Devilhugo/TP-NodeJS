const BlogPost = require('../models/BlogPost.js');

module.exports = async (req, res) => {
  try {
    const image = await BlogPost.findImage(req.params.id);
    if (!image || !image.image_data) return res.status(404).end();

    res.set('Content-Type', image.image_type);
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(image.image_data);
  } catch (error) {
    res.status(404).end();
  }
};
