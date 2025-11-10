// routes/streamingPlatform.js
// GET endpoints for streaming_platform
// - GET /streamingPlatform
// - GET /streamingPlatform/sort/name
// - GET /streamingPlatform/:id
// - GET /streamingPlatform/:id/movies

const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all streaming platforms
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM streaming_platform');
    res.json(rows);
  } catch (err) {
    console.error('GET /streamingPlatform error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET platforms sorted by streaming_platform (column name)
router.get('/sort/name', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM streaming_platform ORDER BY streaming_platform ASC');
    res.json(rows);
  } catch (err) {
    console.error('GET /streamingPlatform/sort error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET all movies on a specific streaming platform
router.get('/:id/movies', async (req, res) => {
  try {
    const platformId = req.params.id;
    const [rows] = await db.query(
      `SELECT m.*
       FROM movie m
       JOIN movie_to_streaming ms ON m.movie_id = ms.movie_id
       WHERE ms.streaming_platform_id = ?`,
      [platformId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /streamingPlatform/:id/movies error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET platform by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM streaming_platform WHERE streaming_platform_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Platform not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /streamingPlatform/:id error', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;