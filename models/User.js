const bcrypt = require('bcryptjs');
const pool = require('../db');

const toId = (id) => (/^\d+$/.test(String(id)) ? Number(id) : null);

// Erreur de validation : renvoie la liste des messages à afficher
function validationError(messages) {
  const error = new Error('ValidationError');
  error.validationErrors = messages;
  return error;
}

async function findByUsername(username) {
  const { rows } = await pool.query(
    'SELECT id, username, password FROM users WHERE username = $1',
    [username]
  );
  return rows[0] || null;
}

async function findById(id) {
  const userId = toId(id);
  if (!userId) return null;
  const { rows } = await pool.query('SELECT id, username FROM users WHERE id = $1', [userId]);
  return rows[0] || null;
}

async function create({ username, password }) {
  username = String(username || '').trim();
  password = String(password || '');

  const errors = [];
  if (!username) errors.push('Please provide username');
  if (!password) errors.push('Please provide password');
  if (username && (await findByUsername(username))) {
    errors.push(`Error, expected \`username\` to be unique. Value: \`${username}\``);
  }
  if (errors.length) throw validationError(errors);

  const hash = await bcrypt.hash(password, 10);

  try {
    const { rows } = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hash]
    );
    return rows[0];
  } catch (error) {
    // 23505 = violation de contrainte UNIQUE (deux inscriptions simultanées)
    if (error.code === '23505') {
      throw validationError([`Error, expected \`username\` to be unique. Value: \`${username}\``]);
    }
    throw error;
  }
}

module.exports = { findByUsername, findById, create };
