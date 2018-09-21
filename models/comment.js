var mongoose= require("mongoose");

var commentSchema= new mongoose.Schema({
    text:String,
        author:{
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"//refers to the model that we're gonna use to refer this
            },
            username:String
        }
});

module.exports= mongoose.model("Comment", commentSchema);