const pool = require('../db');

const toId = (id) => (/^\d+$/.test(String(id)) ? Number(id) : null);

// Liste des articles avec le nom de l'auteur (jointure users)
async function findAll() {
  const { rows } = await pool.query(`
    SELECT p.id, p.title, p.date_posted AS "datePosted", u.username
    FROM blogposts p
    LEFT JOIN users u ON u.id = p.user_id
    ORDER BY p.date_posted DESC
  `);
  return rows;
}

async function findById(id) {
  const postId = toId(id);
  if (!postId) return null;
  const { rows } = await pool.query(`
    SELECT p.id, p.title, p.body, p.date_posted AS "datePosted",
           (p.image_data IS NOT NULL) AS "hasImage", u.username
    FROM blogposts p
    LEFT JOIN users u ON u.id = p.user_id
    WHERE p.id = $1
  `, [postId]);
  return rows[0] || null;
}

async function findImage(id) {
  const postId = toId(id);
  if (!postId) return null;
  const { rows } = await pool.query(
    'SELECT image_data, image_type FROM blogposts WHERE id = $1',
    [postId]
  );
  return rows[0] || null;
}

async function create({ title, body, imageData, imageType, userId }) {
  const { rows } = await pool.query(`
    INSERT INTO blogposts (title, body, image_data, image_type, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [title, body, imageData, imageType, userId]);
  return rows[0];
}

module.exports = { findAll, findById, findImage, create };
