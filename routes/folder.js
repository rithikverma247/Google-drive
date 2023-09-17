var mongoose = require('mongoose');

var folderSchema = mongoose.Schema({
     userid:{
          type: mongoose.Schema.Types.ObjectId, 
          ref:"user"
     },
     folderName:String,
     uploadTime:String,
     folderSize:Number,
     fposts:[{
          type:mongoose.Schema.Types.ObjectId,
           ref: "post"
      }],
      ffolder:[{
          type:mongoose.Schema.Types.ObjectId,
           ref: "folder"
      }],
      
     
},{timestamps:true,})    

module.exports = mongoose.model("folder", folderSchema);
