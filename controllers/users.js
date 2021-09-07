const express = require('express');
const { models } = require('mongoose');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');



module.exports.renderRegisterForm = (req,res)=>{
    res.render('users/register');
}


module.exports.newRegister = async(req,res)=>{
    try{
    const {email,username,password}=req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser,err=>{
        if(err) return next(err);
        req.flash('success','Welcome to Adventure!!');
        res.redirect('/movies');
    })
    } catch(e){
        req.flash('error',e.message);
        res.redirect('register');
    }  
}


module.exports.login = (req,res)=>{
    req.flash('success','Welcome Back!!');
    const redirectUrl = req.session.returnTo || '/movies';
    delete req.session.returnTo;
    res.redirect(redirectUrl);

}


module.exports.renderLoginForm = (req,res)=>{
    res.render('users/login');
}


module.exports.logout = (req,res)=>{
    req.logout();
    req.flash('success','Succesfully Logged out!!');
    res.redirect('/movies');
}

