const Movie = require('./models/movie');

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated())
    {
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in!!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const movie = await Movie.findById(id);
    if(!movie.author.equals(req.user._id))
    {
        req.flash('error','No permission');
        return res.redirect(`/movies/${id}`);
    }
    next();
}
