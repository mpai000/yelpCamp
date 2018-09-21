var express=require("express");
var router=express.Router({mergeParams:true});
var Campground = require("../models/campground");
var middleware = require("../middleware"); //dont need to do ../middleware/index.js as it automacitcally requires file with the name index
var NodeGeocoder = require('node-geocoder'); 
 // for the map--above and below line
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);


//INDEX- show all campgrounds
router.get("/", function(req,res){
   // this is when we'll search for the results 
   if(req.query.search){
       const regex = new RegExp(escapeRegex(req.query.search), 'gi');
       Campground.find({name:regex}, function(err, allCampgrounds){
           if(err){
            console.log(err);
        } else{
            if(allCampgrounds.length<1){
                req.flash("error", "No Campground with that name found");
                res.redirect("/campgrounds");
            }
            res.render("campground/index",{campgrounds:allCampgrounds});
        }
       });
   } else{
       //get all campground from db
       //allCampgrounds is all the campgrounds we got from the db
       Campground.find({}, function(err, allCampgrounds){
           if(err){
            console.log(err);
        } else{
            // first is the name we give it and second is the data we pass 
            // we get campgrounds a=page, and in the campgrounds file, we expect the variable to be called campgrounds: and we pass it allcampgrounds
            res.render("campground/index",{campgrounds:allCampgrounds});// req.user has name and id of logged in user
            // if not logged in, it's undefined
        }
       });
   }
       // first is the name we give it and second is the data we pass 
});

//NEW- Show from to create new campground
router.get("/new", middleware.isLoggedIn, function(req,res){
   res.render("campground/new");
});

//CREATE- to add new campground to db
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});

//SHOW- shows more info about one campground
router.get("/:id", function(req,res){
    // find the campground with that id
    // we use the .populate method as inside the db, comment is just an id, but we need its data
    // now foundCampground should have the acutal comments
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
      if(err || !foundCampground){
          req.flash("error","Campground not found");
          res.redirect("back");
          console.log(err);
      } else{
            // render show template with that campground
            // inside the show template, we can acess campground which will have the value
            // of what we found with that id :req.params.id
            res.render("campground/show", {campground: foundCampground});
      } 
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundAuth, function(req,res){
     Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campground/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundAuth, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// DELETE CAMPGROUND
router.delete("/:id", middleware.checkCampgroundAuth, function(req,res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/camgrounds"); 
      } else{
            res.redirect("/campgrounds/");
      } 
    }); 
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports=router;
