if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}



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

// process.env.DB_URL || 
// "mongodb://localhost:27017/Adventure"
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/Adventure";
const monogoSanitize = require('express-mongo-sanitize');
const { networkInterfaces } = require('os');
const secret = process.env.SECRET || 'THISSHOULDBEABETTERSECRET';
const MongoDBStore = require('connect-mongo')(session);
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


const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter:24*3600
});

store.on("error",function(e){
    console.log('session error',e);
})

const sessionConfig = {
    name: 'movieSession',
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now()+1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));



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


