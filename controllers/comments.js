const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Movie = require('../models/movie');
const Comment = require('../models/comment');
const {isLoggedIn} = require('../middleware');

module.exports.createComment = async (req,res)=>{
    const movie = await Movie.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    movie.comments.push(comment);
    await comment.save();
    await movie.save();
    req.flash('success','Created new comment')
    res.redirect(`/movies/${movie._id}`);
}


module.exports.deleteComment = async(req,res)=>{
    await Movie.findByIdAndUpdate(req.params.id,{$pull:{comments: req.params.commentId}});
    await Comment.findByIdAndDelete(req.params.commentId);
     res.redirect(`/movies/${req.params.id}`);
}