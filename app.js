if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const Campground=require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require ('ejs-mate');
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
const Joi = require('joi');
const {campgroundSchema,reviewSchema} = require('./schemas');
const Review = require('./models/review');
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
/* const {MongoStore} = require('connect-mongo') */
const MongoStore = require('connect-mongo');

/* const helmet = require('helmet') */
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);
/* mongoose.connect('mongodb://localhost:27017/yelp-camp'); */

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',()=>{
    console.log('Database connected');
})
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.engine('ejs',ejsMate);
const secret = process.env.SECRET ||'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl:dbUrl,
    secret,
    touchAfter:24*60*60



});
store.on('error',function(e){
    console.log('STORE ERROR');
})

const sessionConfig = {
    store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
    httpOnly:true,
    /* secure:true, */
    expires: Date.now()+1000*60*60*24*7,
    maxAge:1000*60*60*24*7}
}

app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());









app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize());


/* const validateCampground = (req,res,next)=>{
    
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
}

const validateReview = (req,res,next)=>{

    const{error} = reviewSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressError(msg,400)
    }
    else{
        next();
    }
} */



app.use((req,res,next)=>{
    
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error'); 
    next();

})
/* app.get('/fakeUser', async (req,res)=>{
    const user = new User({email:'colt@gmail.com', username:'colt'});
    const newUser = await User.register(user,'chicken');
    res.send(newUser);


}) */
app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);


app.get('/',(req,res)=>{
    res.render('home')
})




app.all('*',(req,res,next)=>{
    next(new ExpressError('Page not found',404))
})





app.use((err,req,res,next)=>{

    const {message='Something went wrong',statusCode=500}=err;
    if(!err.message)err.message='Something went wrong.'
    res.status(statusCode).render('error',{err})
    

})



const port = process.env.PORT||3000;



app.listen(port,()=>{
    console.log(`serving on port ${port}`)
})
