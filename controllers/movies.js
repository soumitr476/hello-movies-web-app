const express = require('express');
const router = express.Router();
const movies = require('./movies');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Movie = require('../models/movie');
const {isLoggedIn,isAuthor} = require('../middleware');



module.exports.index = async (req,res)=>{
    const movie = await Movie.find(); 
    res.render('movies/index',{movie});
}

module.exports.renderNewForm = (req,res)=>{
    res.render('movies/new');
}

module.exports.createMovie = async(req,res,next)=>{
    const movie = new Movie(req.body);
    movie.image = req.file.path;
    movie.author = req.user._id;
    await movie.save();
    req.flash('success','Succesfully added a new movie');
    res.redirect('/movies');
}

module.exports.showMovies = async(req,res)=>{
    const movie = await Movie.findById(req.params.id).populate({path:'comments',populate:{path:'author'}}).populate('author'); 
    res.render('movies/show',{movie});
}

module.exports.renderEditForm = async(req,res) => {
    const movie = await Movie.findById(req.params.id); 
    if(!movie)
    {
        req.flash('error','Cant find movie');
        return res.redirect(`/movies`);
    }
    res.render('movies/edit',{movie});
}

module.exports.editMovie = async(req,res)=>{
    const { id } = req.params;
     const movie = await Movie.findByIdAndUpdate(id, req.body,{new:true});
    req.flash('success','Successfully Updated')
    res.redirect('/movies')
}

module.exports.deleteMovie = async (req,res)=>{
    const { id } = req.params;
    await Movie.findByIdAndDelete(id);
    res.redirect('/movies');
}




