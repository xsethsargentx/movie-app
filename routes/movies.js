const express = require('express');
const axios = require('axios');
const router = express.Router();

const genres = [
  'animation',
  'classic',
  'comedy',
  'drama',
  'horror',
  'family',
  'mystery',
  'western'
];

// ✅ All Movies by Genre (with pagination)
router.get('/:genre', async (req, res, next) => {
  try {
    const { genre } = req.params;
    if (!genres.includes(genre)) throw new Error('Genre not found');

    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const response = await axios.get(`https://api.sampleapis.com/movies/${genre}`);
    const allMovies = response.data;

    const totalPages = Math.ceil(allMovies.length / limit);
    const movies = allMovies.slice((page - 1) * limit, page * limit);

    // movies.js route
    res.render('pages/allMovies', {
    title: genre.charAt(0).toUpperCase() + genre.slice(1), // just "Classic", "Comedy", etc.
      genres,
      movies,
      currentPage: page,
      totalPages,
      genre
});
  } catch (err) {
    next(err);
  }
});

// Single movie
router.get('/:genre/:id', async (req, res, next) => {
  try {
    const { genre, id } = req.params;
    if (!genres.includes(genre)) throw new Error('Genre not found');

    const response = await axios.get(`https://api.sampleapis.com/movies/${genre}`);
    const movie = response.data.find(m => m.id == id);
    if (!movie) throw new Error('Movie not found');

    // Pass the genre explicitly to use in the "back" link
    res.render('pages/singleMovie', {
      movie,
      genres,
      genre
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;