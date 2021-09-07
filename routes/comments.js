const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Movie = require('../models/movie');
const Comment = require('../models/comment');
const {isLoggedIn} = require('../middleware');
const comments = require('../controllers/comments');

router.post('/',isLoggedIn,catchAsync(comments.createComment));

router.delete('/:commentId',isLoggedIn,catchAsync(comments.deleteComment));

module.exports = router;