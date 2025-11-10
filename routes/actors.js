// routes/actors.js
// GET endpoints for actor table
// - GET /actors             -> findAll
// - GET /actors/sort/:field -> sort (safe fields list)
// - GET /actors/:id         -> find by id
// - GET /actors/:id/movies  -> custom: all movies for actor

const express = require('express');
const router = express.Router();
const db = require('../db'); // root-level db.js that exports promise pool

// Valid fields allowed for sorting (protect against SQL injection)
const validSortFields = ['actor_id', 'first_name', 'last_name'];

// ------------------------
// GET all actors
// ------------------------
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM actor');
    res.json(rows);
  } catch (err) {
    console.error('GET /actors error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ------------------------
// GET actors sorted by field
// Example: /actors/sort/last_name
// ------------------------
router.get('/sort/:field', async (req, res) => {
  try {
    const { field } = req.params;
    if (!validSortFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid sort field' });
    }
    const [rows] = await db.query(`SELECT * FROM actor ORDER BY ${field} ASC`);
    res.json(rows);
  } catch (err) {
    console.error('GET /actors/sort error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ------------------------
// GET all movies for a specific actor
// Example: /actors/1/movies
// ------------------------
router.get('/:id/movies', async (req, res) => {
  try {
    const actorId = req.params.id;
    const [rows] = await db.query(
      `SELECT m.* 
       FROM movie m
       JOIN movie_to_actor ma ON m.movie_id = ma.movie_id
       WHERE ma.actor_id = ?`,
      [actorId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /actors/:id/movies error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ------------------------
// GET actor by ID
// Example: /actors/1
// ------------------------
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM actor WHERE actor_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Actor not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /actors/:id error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;