// routes/directors.js
// GET endpoints for director table
// - GET /directors
// - GET /directors/sort/:field
// - GET /directors/:id
// - GET /directors/:id/movies  (movies a director worked on)

const express = require('express');
const router = express.Router();
const db = require('../db');

const validSortFields = ['director_id', 'first_name', 'last_name'];

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM director');
    res.json(rows);
  } catch (err) {
    console.error('GET /directors error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// sort route (keep before /:id)
router.get('/sort/:field', async (req, res) => {
  try {
    const { field } = req.params;
    if (!validSortFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid sort field' });
    }
    const [rows] = await db.query(`SELECT * FROM director ORDER BY ${field} ASC`);
    res.json(rows);
  } catch (err) {
    console.error('GET /directors/sort error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// custom: movies by director
router.get('/:id/movies', async (req, res) => {
  try {
    const directorId = req.params.id;
    const [rows] = await db.query(
      `SELECT m.*
       FROM movie m
       JOIN movie_to_director md ON m.movie_id = md.movie_id
       WHERE md.director_id = ?`,
      [directorId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /directors/:id/movies error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM director WHERE director_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Director not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /directors/:id error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;