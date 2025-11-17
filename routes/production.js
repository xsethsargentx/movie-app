// routes/production.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ----------------------------
// GET form to add a new production
// ----------------------------
router.get('/new', async (req, res, next) => {
  try {
    // Fetch genres from DB to pass into the header/navbar
    const [allGenres] = await db.query('SELECT genre FROM genre');

    // Map to an array of strings (header expects strings)
    const genreNames = allGenres.map(g => g.genre);

    res.render('pages/newProduction', {
      title: 'Add New Production Company',
      genres: genreNames
    });
  } catch (err) {
    next(err);
  }
});
// ----------------------------
// POST new production
// ----------------------------
router.post('/', async (req, res) => {
  try {
    const { production } = req.body;
    if (!production) {
      return res.status(400).json({ error: 'Production name is required' });
    }

    const [result] = await db.query(
      'INSERT INTO production (production) VALUES (?)',
      [production]
    );

    res.json({ message: 'Production company created', production_id: result.insertId });
  } catch (err) {
    console.error('POST /production error', err);
    res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
  }
});

// ----------------------------
// PATCH existing production
// ----------------------------
router.patch('/:id', async (req, res) => {
  try {
    const { production } = req.body;
    if (!production) {
      return res.status(400).json({ error: 'Production name is required' });
    }

    const [result] = await db.query(
      'UPDATE production SET production = ? WHERE production_id = ?',
      [production, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Production not found' });
    }

    res.json({ message: 'Production company updated successfully' });
  } catch (err) {
    console.error('PATCH /production/:id error', err);
    res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
  }
});

module.exports = router;