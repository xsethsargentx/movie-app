const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

const genres = ['animation','classic','comedy','drama','horror','family','mystery','western'];

// ----------------------------
// GET form for new movie
// ----------------------------
router.get('/new', async (req, res, next) => {
  try {
    // Fetch genres, directors, productions from DB for dropdowns
    const [genreRows] = await db.query('SELECT * FROM genre');
    const [directorRows] = await db.query('SELECT * FROM director');
    const [productionRows] = await db.query('SELECT * FROM production');

    // Map genres to strings so header works correctly
    const genreNames = genreRows.map(g => g.genre);

    res.render('pages/newMovie', {
      title: 'Add New Movie',   // fixes header.ejs title
      genres: genreNames,       // array of strings for header nav
      formGenres: genreRows,    // full objects for dropdown in form
      directors: directorRows,
      productions: productionRows
    });
  } catch (err) {
    console.error('GET /movies/new error', err);
    next(err);
  }
});

// ----------------------------
// GET form for new movie
// ----------------------------
router.get('/new', async (req, res, next) => {
  try {
    // fetch productions, directors, and genres for dropdown selects
    const [productions] = await db.query('SELECT * FROM production');
    const [directors] = await db.query('SELECT * FROM director');
    const [allGenres] = await db.query('SELECT * FROM genre');

    res.render('pages/newMovie', {
      title: 'Add New Movie', // required for header.ejs
      productions,
      directors,
      genres: allGenres
    });
  } catch (err) {
    console.error('GET /movies/new error', err);
    next(err);
  }
});

// ----------------------------
// POST new movie to DB
// ----------------------------
router.post('/db', async (req, res) => {
  try {
    const { title, production_id, yr_released, genre_id, director_id } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const [result] = await db.query(
      'INSERT INTO movie (title, production_id, yr_released) VALUES (?, ?, ?)',
      [title, production_id, yr_released]
    );

    const movieId = result.insertId;

    if (genre_id) {
      await db.query('INSERT INTO movie_to_genre (movie_id, genre_id) VALUES (?, ?)', [movieId, genre_id]);
    }
    if (director_id) {
      await db.query('INSERT INTO movie_to_director (movie_id, director_id) VALUES (?, ?)', [movieId, director_id]);
    }

    res.json({ message: 'Movie created', movie_id: movieId });
  } catch (err) {
    console.error('POST /movies/db error', err);
    res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
  }
});

// ----------------------------
// PATCH existing movie
// ----------------------------
router.patch('/db/:id', async (req, res) => {
  try {
    const movieId = req.params.id;
    const { title, production_id, yr_released, genre_id, director_id } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

    await db.query(
      'UPDATE movie SET title = ?, production_id = ?, yr_released = ? WHERE movie_id = ?',
      [title, production_id, yr_released, movieId]
    );

    if (genre_id) {
      await db.query('DELETE FROM movie_to_genre WHERE movie_id = ?', [movieId]);
      await db.query('INSERT INTO movie_to_genre (movie_id, genre_id) VALUES (?, ?)', [movieId, genre_id]);
    }
    if (director_id) {
      await db.query('DELETE FROM movie_to_director WHERE movie_id = ?', [movieId]);
      await db.query('INSERT INTO movie_to_director (movie_id, director_id) VALUES (?, ?)', [movieId, director_id]);
    }

    res.json({ message: 'Movie updated successfully', movie_id: movieId });
  } catch (err) {
    console.error('PATCH /movies/db/:id error', err);
    res.status(500).json({ error: 'Database error', details: err.sqlMessage || err.message });
  }
});

// ----------------------------
// Render all movies (from API)
// ----------------------------
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    let allMovies = [];

    for (const genre of genres) {
      const response = await axios.get(`https://api.sampleapis.com/movies/${genre}`);
      allMovies = allMovies.concat(response.data.map(m => ({ ...m, genre })));
    }

    const totalPages = Math.ceil(allMovies.length / limit);
    const movies = allMovies.slice((page-1)*limit, page*limit);

    res.render('pages/allMovies', {
      title: 'All Movies',
      genres,
      movies,
      currentPage: page,
      totalPages,
      genre: ''
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------
// Render movies by genre
// ----------------------------
router.get('/:genre', async (req, res, next) => {
  try {
    const { genre } = req.params;
    if (!genres.includes(genre)) throw new Error('Genre not found');

    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const response = await axios.get(`https://api.sampleapis.com/movies/${genre}`);
    const allMovies = response.data;
    const totalPages = Math.ceil(allMovies.length / limit);
    const movies = allMovies.slice((page-1)*limit, page*limit);

    res.render('pages/allMovies', {
      title: genre.charAt(0).toUpperCase() + genre.slice(1),
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

// ----------------------------
// Render single movie page
// ----------------------------
router.get('/:genre/:id', async (req, res, next) => {
  try {
    const { genre, id } = req.params;
    if (!genre || !genres.includes(genre)) return res.redirect('/movies');

    const response = await axios.get(`https://api.sampleapis.com/movies/${genre}`);
    const movie = response.data.find(m => m.id == id);

    if (!movie) return res.status(404).render('pages/error', { message: 'Movie not found', genres });

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