// routes/genres.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// ----------------------------
// GET form to add a new genre
// ----------------------------
router.get('/new', async (req, res, next) => {
  try {
    // Fetch genres from DB to pass into the header/navbar
    const [allGenres] = await db.query('SELECT genre FROM genre');

    // Map to an array of strings (header expects strings)
    const genreNames = allGenres.map(g => g.genre);

    res.render('pages/newGenre', {
      title: 'Add New Genre',
      genres: genreNames
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------
// POST new genre
// ----------------------------
router.post('/', async (req, res) => {
  try {
    const { genre } = req.body;
    if (!genre) return res.status(400).json({ error: 'Genre name is required' });

    const [result] = await db.query('INSERT INTO genre (genre) VALUES (?)', [genre]);
    res.json({ message: 'Genre created', genre_id: result.insertId });
  } catch (err) {
    console.error('POST /genres error', err);
    res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
  }
});

// ----------------------------
// PATCH existing genre
// ----------------------------
router.patch('/:id', async (req, res) => {
  try {
    const { genre } = req.body;
    if (!genre) return res.status(400).json({ error: 'Genre name is required' });

    const [result] = await db.query(
      'UPDATE genre SET genre = ? WHERE genre_id = ?',
      [genre, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Genre not found' });
    }

    res.json({ message: 'Genre updated successfully' });
  } catch (err) {
    console.error('PATCH /genres/:id error', err);
    res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
  }
});

module.exports = router;