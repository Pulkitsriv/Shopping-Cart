if(process.env.NODE_ENV != 'production'){
  require('dotenv').config({path: './config.env'})
}


const express = require("express");
const path = require("path")
const engine = require("ejs-mate")
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session")
const flash = require("connect-flash");
const User = require("./models/User")
const passport = require("passport");
var LocalStrategy = require('passport-local');


const dburl = process.env.DB_URL || "mongodb://127.0.0.1:27017/shopping-cart";

//Connect to DB
mongoose.connect(dburl, {useNewUrlParser: true, useUnifiedTopology:true})
.then(()=> console.log(" DB CONNECTED!"))
.catch((err)=> console.log(err));


const session_secret = process.env.SESSION_SECRET || 'this is a secret session'

const sessionflash = {
    secret: session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: {

      httpOnly:true,
      expires: Date.now()  + 7 *24*60*60*1000
    }
  };
  
  app.use(session(sessionflash))
  app.use(flash());
  app.use(passport.authenticate('session'));


  app.use((req, res, next) => {

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();

  });
  


// All Product Routes
const productRouter = require("./routes/productRoutes");

//Review Routes

const reviewRouter = require("./routes/reviewRoutes")

// Auth router

const authRouter = require("./routes/authRoutes")


// Middlewares
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.engine("ejs", engine)
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views" ))
app.use(express.static(path.join(__dirname,'public')))



// Passport 

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//home route
app.get("/", (req,res)=>{

    res.render("index")
})



// Routers

app.use( productRouter); 
app.use(reviewRouter);
app.use(authRouter);



app.listen(PORT, ()=>{

    console.log(` server running at port ${PORT}`)
})