const express = require('express');
const router = express.Router();

const genres = ['animation', 'classic', 'comedy', 'drama', 'horror', 'family', 'mystery', 'western'];

router.get('/', (req, res) => {
  res.render('pages/home', { title: 'Home', genres });
});

module.exports = router;