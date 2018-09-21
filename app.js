require('dotenv').config();
var express =       require("express"),
    app =           express(),
    bodyParser=     require("body-parser"),
    mongoose=       require("mongoose"),
    passport=       require("passport"),
    flash=          require("connect-flash"),
    LocalStratergy= require("passport-local"),
    methodOverride= require("method-override"),
    Campground=     require("./models/campground"),
    Comment=        require("./models/comment"),
    User=           require("./models/user"),
    seedDB=         require("./seeds");


//requiring routes
var commentRoutes=         require("./routes/comments"),
    campgroundRoutes=       require("./routes/campgrounds"),
    authRoutes=             require("./routes/auth");

//create yelp camp database inside mongo db
mongoose.connect('mongodb://localhost:27017/yelp_camp_v12', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+ "/public"));// to connect to the css style sheet
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "blah blah blah",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to has current user to all routes
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error=req.flash("error");
   res.locals.success=req.flash("success");
   next();
});

app.use(authRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Yelcamp Server has started!!");
}); 