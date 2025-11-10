// routes/production.js
// GET endpoints for production table
// - GET /production
// - GET /production/sort/name
// - GET /production/:id
// - GET /production/:id/movies  (movies produced by company)

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all productions
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM production');
    res.json(rows);
  } catch (err) {
    console.error('GET /production error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET productions sorted by production (column name is "production")
router.get('/sort/name', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM production ORDER BY production ASC');
    res.json(rows);
  } catch (err) {
    console.error('GET /production/sort error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET movies for a specific production company
router.get('/:id/movies', async (req, res) => {
  try {
    const productionId = req.params.id;
    const [rows] = await db.query(
      `SELECT m.*
       FROM movie m
       JOIN movie_to_production mp ON m.movie_id = mp.movie_id
       WHERE mp.production_id = ?`,
      [productionId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /production/:id/movies error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET production by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM production WHERE production_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Production not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /production/:id error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;