if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}


"use strict";
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const cookieParser = require('cookie-parser');
const User = require('./models/user');
const Movie = require('./models/movie');
const users = require('./routes/users');
const movies = require('./routes/movies');
const comments = require('./routes/comments');
const helmet = require('helmet');
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/Adventure";

// const dbUrl = process.env.DB_URL;
const monogoSanitize = require('express-mongo-sanitize');
const { networkInterfaces } = require('os');
const secret = process.env.SECRET || 'THISSHOULDBEABETTERSECRET';
mongoose.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false,useCreateIndex:true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database Connected');
});

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(monogoSanitize());
app.use(helmet({contentSecurityPolicy:false}));

const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: dbUrl,
    collection: 'sessions'
});
store.on("error",function(e){
    console.log('session error',e);
})
app.use(session({
    name: 'movieSession',
    secret,
    resave: false,
    saveUninitialized: true,
    store,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}));



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req,res,next)=>{
    
    res.locals.registeredUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/',users);
app.use('/movies',movies);
app.use('/movies/:id/comments',comments);



app.get('/',(req,res)=>{
    res.render('home')
})


app.all('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err,req,res,next)=>{
    const {statusCode = 500,message = 'something is wrong'} = err;
    res.status(statusCode).render('error');
})

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Listening to port ${port}`);
})



// const addMovie = async ()=>{
//     await Movie.deleteMany({});

//     const d1 = new Movie({title:'Free Guy',genre:'Comedy',author:'612b69905bb7eb308cfc25be',cast:'Ryan Reynolds',director:'Shawn Levy',review:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla, nam laborum! Doloremque autem excepturi voluptas voluptate sit ratione suscipit dolorum minima saepe expedita itaque illum voluptatem adipisci delectus doloribus, hic molestiae repellendus aperiam corrupti veritatis libero! Quasi delectus, facilis dolore non sapiente modi, quidem consequuntur aut a vero tempora officiis obcaecati. Optio, tempore deserunt. Officiis nemo nobis excepturi quas veniam.",image:'https://cdn-s3.allmovie.com/movie_images/V722277/homepage.jpg'})
//     await d1.save();


//     const d2 = new Movie({title:'Aladdin',genre:'Fantasy',author:'612b69905bb7eb308cfc25be',cast:'Sonbeel',director:'Guy Ritchie',review:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla, nam laborum! Doloremque autem excepturi voluptas voluptate sit ratione suscipit dolorum minima saepe expedita itaque illum voluptatem adipisci delectus doloribus, hic molestiae repellendus aperiam corrupti veritatis libero! Quasi delectus, facilis dolore non sapiente modi, quidem consequuntur aut a vero tempora officiis obcaecati. Optio, tempore deserunt. Officiis nemo nobis excepturi quas veniam.",image:'https://lumiere-a.akamaihd.net/v1/images/p_aladdin2019_17638_d53b09e6.jpeg'})
//     await d2.save();

    
//     const d3 = new Movie({title:'Fast9',genre:'Action',author:'612b69905bb7eb308cfc25be',cast:'Vin Diesel',director:'Justin Lin',review:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla, nam laborum! Doloremque autem excepturi voluptas voluptate sit ratione suscipit dolorum minima saepe expedita itaque illum voluptatem adipisci delectus doloribus, hic molestiae repellendus aperiam corrupti veritatis libero! Quasi delectus, facilis dolore non sapiente modi, quidem consequuntur aut a vero tempora officiis obcaecati. Optio, tempore deserunt. Officiis nemo nobis excepturi quas veniam.",image:'https://d2j1wkp1bavyfs.cloudfront.net/admin-uploads/posters/f9-movie-poster_1618415923.jpg?d=360x540&q=50'})
//     await d3.save();

//     const d4 = new Movie({title:'Star Wars',genre:'Space-Adventure',author:'612b69905bb7eb308cfc25be',cast:'Mark Hamill,Natalie Portman',director:'Rian Johnson',review:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla, nam laborum! Doloremque autem excepturi voluptas voluptate sit ratione suscipit dolorum minima saepe expedita itaque illum voluptatem adipisci delectus doloribus, hic molestiae repellendus aperiam corrupti veritatis libero! Quasi delectus, facilis dolore non sapiente modi, quidem consequuntur aut a vero tempora officiis obcaecati. Optio, tempore deserunt. Officiis nemo nobis excepturi quas veniam.",image:'https://mlpnk72yciwc.i.optimole.com/cqhiHLc.WqA8~2eefa/w:auto/h:auto/q:75/https://bleedingcool.com/wp-content/uploads/2020/05/star-wars-the-complete-saga-will-be-on-disney-monday-credit-disney.jpg'})
//     await d4.save();

//     const d5 = new Movie({title:'Ra One',genre:'SuperHero',author:'612b69905bb7eb308cfc25be',cast:'Shahrukh Khan,Kareena Kapoor',director:'Anubhav Sinha',review:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla, nam laborum! Doloremque autem excepturi voluptas voluptate sit ratione suscipit dolorum minima saepe expedita itaque illum voluptatem adipisci delectus doloribus, hic molestiae repellendus aperiam corrupti veritatis libero! Quasi delectus, facilis dolore non sapiente modi, quidem consequuntur aut a vero tempora officiis obcaecati. Optio, tempore deserunt. Officiis nemo nobis excepturi quas veniam.",image:'https://m.media-amazon.com/images/M/MV5BMzcyMjMxOTg4MF5BMl5BanBnXkFtZTcwNzEwMDE5Ng@@._V1_FMjpg_UX1000_.jpg'})
//     await d5.save();
// }

    

// addMovie();