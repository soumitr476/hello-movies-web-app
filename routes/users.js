const express = require('express');
const { models } = require('mongoose');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const users = require('../controllers/users');

router.get('/register',users.renderRegisterForm);

router.post('/register',catchAsync(users.newRegister));

router.get('/login',users.renderLoginForm);

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.login);

router.get('/logout',users.logout);

module.exports = router;