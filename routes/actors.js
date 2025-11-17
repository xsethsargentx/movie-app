// routes/actors.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // root-level db.js that exports promise pool

// Valid fields allowed for sorting (protect against SQL injection)
const validSortFields = ['actor_id', 'first_name', 'last_name'];

// ------------------------
// GET all actors
// Route: GET /actors
// ------------------------
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM actor');
    res.json(rows);
  } catch (err) {
    console.error('GET /actors error', err);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// ------------------------
// EJS form for new actor
// Route: GET /actors/new
// IMPORTANT: must be before any "/:id" routes
// ------------------------
router.get('/new', (req, res) => {
  // If you want to include dropdowns (e.g., movies) add a DB query here and pass them:
  // const [movies] = await db.query('SELECT movie_id, title FROM movie');
  res.render('pages/newActor', {
    title: 'Add New Actor',
    // movies: movies || [], // uncomment if you fetch movies
    genres: [] // keep for header if your header expects genres (or pass real list)
  });
});

// ------------------------
// Optional: a small helper form route if you used actor-form previously
// Route: GET /actors/form
// (You can keep or remove; I included it to avoid 404 if something points here)
// ------------------------
router.get('/form', (req, res) => {
  res.render('pages/actor-form', { title: 'Add or Update Actor', genres: [] });
});

// ------------------------
// GET all movies for a specific actor
// Route: GET /actors/:id/movies
// NOTE: keep this BEFORE the generic /:id route
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
    res.status(500).json({ error: err.message });
  }
});

// ------------------------
// GET actor by ID
// Route: GET /actors/:id
// ------------------------
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM actor WHERE actor_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Actor not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /actors/:id error', err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------
// POST new actor
// Route: POST /actors
// Example body: { first_name: "Keanu", last_name: "Reeves" }
// ------------------------
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name } = req.body;

    // validation to prevent empty insert
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'first_name and last_name are required' });
    }

    const [result] = await db.query(
      'INSERT INTO actor (first_name, last_name) VALUES (?, ?)',
      [first_name, last_name]
    );

    res.json({ message: 'Actor added successfully', actor_id: result.insertId });
  } catch (err) {
    console.error('POST /actors error', err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------
// PATCH actor
// Route: PATCH /actors/:id
// Example body: { first_name: "John", last_name: "Wick" }
// ------------------------
router.patch('/:id', async (req, res) => {
  try {
    const { first_name, last_name } = req.body;
    const actorId = req.params.id;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'first_name and last_name are required' });
    }

    const [result] = await db.query(
      'UPDATE actor SET first_name = ?, last_name = ? WHERE actor_id = ?',
      [first_name, last_name, actorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Actor not found' });
    }

    res.json({ message: 'Actor updated successfully', actor_id: actorId });
  } catch (err) {
    console.error('PATCH /actors/:id error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;