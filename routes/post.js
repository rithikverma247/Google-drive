var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
     userid:{
          type: mongoose.Schema.Types.ObjectId, 
          ref:"user"
     },
     folderid:{
          type: mongoose.Schema.Types.ObjectId, 
          ref:"folder"
     },
     pic:String,
     picName:String,
     picSize:Number,
     expiringTime:String,
     uploadTime:String,
     picId:String,  
     originalName:String,
     ext:String,
     fileId:String

},{timestamps:true,})

module.exports = mongoose.model("post", postSchema);
