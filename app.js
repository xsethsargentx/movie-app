const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const moviesRouter = require('./routes/movies');

const app = express();

const actorsRouter = require('./routes/actors');
const directorsRouter = require('./routes/directors');
const genresRouter = require('./routes/genres');
const productionRouter = require('./routes/production');
const streamingRouter = require('./routes/streamingPlatform');

app.use('/actors', actorsRouter);
app.use('/directors', directorsRouter);
app.use('/genres', genresRouter);
app.use('/production', productionRouter);
app.use('/streamingPlatform', streamingRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);
app.use('/movies', moviesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('pages/error', { 
    title: 'Error', 
    message: err.message,
    genres: ['animation', 'classic', 'comedy', 'drama', 'horror', 'family', 'mystery', 'western']
  });
});

module.exports = app;