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

// All Movies (no genre filter)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    let allMovies = [];

    // Fetch movies from all genres
    for (const genre of genres) {
      const response = await axios.get(`https://api.sampleapis.com/movies/${genre}`);
      // Attach genre to each movie for links
      allMovies = allMovies.concat(response.data.map(m => ({ ...m, genre })));
    }

    const totalPages = Math.ceil(allMovies.length / limit);
    const movies = allMovies.slice((page - 1) * limit, page * limit);

    res.render('pages/allMovies', {
      title: 'All Movies',
      genres,
      movies,
      currentPage: page,
      totalPages,
      genre: '' // optional, not needed for "all movies"
    });
  } catch (err) {
    next(err);
  }
});

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

    // Catch empty or invalid genre
    if (!genre || !genres.includes(genre)) {
      return res.redirect('/movies'); // redirect to All Movies instead of throwing error
    }

    const response = await axios.get(`https://api.sampleapis.com/movies/${genre}`);
    const movie = response.data.find(m => m.id == id);

    if (!movie) {
      return res.status(404).render('pages/error', { message: 'Movie not found', genres });
    }

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