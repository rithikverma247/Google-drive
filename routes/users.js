const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const folder = require('./folder');

mongoose.connect("mongodb+srv://arbazkhan290602:Arbazkhan290602@cluster0.ttk9ral.mongodb.net/")
.then(function(connected){
    console.log("connected!");
});

var userSchema = mongoose.Schema({
    username:String,
    name:String,
    email:String,
    Birthday:String,
    Gender:String,
    Phone:String,
    profileimg:String,
    Home:String,
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
         ref: "post"
    }],
    starredFolder:[{
        type:mongoose.Schema.Types.ObjectId,
         ref: "folder"
    }],
    starred:[{
        type:mongoose.Schema.Types.ObjectId,
         ref: "post"
    }],
    trashFolder:[{
        type:mongoose.Schema.Types.ObjectId,
         ref: "folder"
    }],
    trash:[{
        type:mongoose.Schema.Types.ObjectId,
         ref: "post"
    }],
    recent:[{
        type:mongoose.Schema.Types.ObjectId,
         ref: "post"
    }],
    folder:[{
        type:mongoose.Schema.Types.ObjectId,
         ref: "folder"
    }],

    past:[{
        type:mongoose.Schema.Types.ObjectId,
         ref: "post"
    }],
    token: {
        type: String,
        default: "",
      },
      expiringTime: String,
      Storage: {
        type: Number,
        require:true,
        
    }
    
},{timestamps:true})
// userSchema.plugin(plm);
userSchema.plugin(plm, { usernameField : 'email' });


module.exports = mongoose.model('user',userSchema);


// Middleware function to check and update expired posts
userSchema.pre('save', function(next) {
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000); // 20 minutes ago
  
    // Filter the posts array for expired posts
    const expiredPosts = this.posts.filter(postId => {
      const post = this.past.find(recentPostId => recentPostId.equals(postId));
      return post && post.expiryTime < twentyMinutesAgo;
    });
  
    // Remove expired posts from posts array
    this.posts = this.posts.filter(postId => !expiredPosts.includes(postId));
  
    // Add expired posts to recent array
    this.past.unshift(...expiredPosts);
  
    next();
  });
  
