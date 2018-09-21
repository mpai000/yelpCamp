var express=require("express");
var router=express.Router({mergeParams:true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware"); //dont need to do ../middleware/index.js as it automacitcally requires file with the name index

//=====================================
//COMMENTS ROUTES
//=====================================

//to go to the form page for comments
router.get("/new", middleware.isLoggedIn, function(req, res) {
    //find campground by id
    Campground.findById(req.params.id,function(err, campground){
        if(err){
            console.log(err);
        }else{
         //all the render pages are from inside view
        res.render("comments/new", {campground:campground});
        }
    });
});

//comments create
router.post("/", middleware.isLoggedIn,function(req,res){
   //look up campground using id
   Campground.findById(req.params.id,function(err, campground) {
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       }else
       //create new comment
       Comment.create(req.body.comment, function(err,comment){
          if (err){
              req.flash("error","Something went wrong");
              console.log(err);
          } else{
              //add username and id to comment
              comment.author.id=req.user._id;
              comment.author.username=req.user.username;
              //save comment
              comment.save();
              //connect new comment to campground
              campground.comments.push(comment);
              campground.save();
              //redirect to campground show page
              req.flash("success","Successfully created comment");
              res.redirect("/campgrounds/"+ campground._id);
          }
       });
   });
});

//EDIT COMMENT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentAuth, function(req,res){
    Campground.findById(req.params.id, function(err, foundcampground) {
       if(err || !foundcampground){
            req.flash("error", "Campground not found")
            return res.redirect("back");
       } 
        Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err){
            res.redirect("back");
        } else{
            res.render("comments/edit", {campground_id:req.params.id, comment:foundComment});
        }
        });
    });
});

//UPDATE COMMENT
router.put("/:comment_id/", middleware.checkCommentAuth, function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back"); 
      } else{
            res.redirect("/campgrounds/"+req.params.id);
      } 
    });
});;

//DELETE COMMENT
router.delete("/:comment_id/", middleware.checkCommentAuth, function(req,res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if(err){
          res.redirect("back"); 
      } else{
            req.flash("success","Deleted comment");
            res.redirect("/campgrounds/"+ req.params.id);
      } 
    }); 
});

module.exports=router;