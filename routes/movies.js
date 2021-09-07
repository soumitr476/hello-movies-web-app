const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Movie = require('../models/movie');
const {isLoggedIn,isAuthor} = require('../middleware');
const movies = require('../controllers/movies');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});


router.get('/',catchAsync(movies.index));

router.get('/new',isLoggedIn,movies.renderNewForm);

router.post('/',upload.single('image'),isLoggedIn,catchAsync(movies.createMovie));


router.get('/:id',catchAsync(movies.showMovies));

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(movies.renderEditForm));

router.put('/:id',isLoggedIn,isAuthor,catchAsync(movies.editMovie));

router.delete('/:id',isLoggedIn,isAuthor,catchAsync(movies.deleteMovie));

module.exports = router;