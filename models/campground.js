var mongoose= require("mongoose");
//SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image:String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
  
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            href:"User"
        },
        username:String
    },
    comments: [
        {
            // we embed not the actual comments, but a reference to them
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }]
});

// we now have methods we can use like Campground.find()
//so when we do show collections... we se campgrounds.. as it pluralizes "Campground"
var Campground = mongoose.model("Campground", campgroundSchema);
module.exports = Campground;

