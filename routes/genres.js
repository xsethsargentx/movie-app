// routes/genres.js
// GET endpoints for genre table
// - GET /genres
// - GET /genres/sort/genre
// - GET /genres/:id
// - GET /genres/:id/movies  (movies in that genre)

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all genres
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM genre');
    res.json(rows);
  } catch (err) {
    console.error('GET /genres error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET genres sorted by the "genre" column (not "name")
router.get('/sort/genre', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM genre ORDER BY genre ASC');
    res.json(rows);
  } catch (err) {
    console.error('GET /genres/sort error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET all movies in a genre
router.get('/:id/movies', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.movie_id, m.title
       FROM movie m
       JOIN movie_to_genre mg ON m.movie_id = mg.movie_id
       WHERE mg.genre_id = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /genres/:id/movies error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET genre by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM genre WHERE genre_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Genre not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /genres/:id error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;