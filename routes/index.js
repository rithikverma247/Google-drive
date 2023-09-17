const express = require("express");
const router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const folderModel = require("./folder");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const foldername = "/";
const passport = require('passport');
const GoogleStrategy = require('passport-google-oidc');
require('dotenv').config();
const mailer = require("../nodemailer");
const localStrategy = require('passport-local');
// passport.use(new localStrategy(userModel.authenticate()));

passport.use(new localStrategy({
  usernameField: 'email',
  usernameQueryFields: ['email']
}, userModel.authenticate()));

// google authenticate.

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: ['email','profile' ]
},async function verify(issuer, profile, cb) {
      console.log(profile);
      let user = await userModel.findOne({email:profile.emails[0].value})
      if(user){
          return cb(null,user)
      }else{

          let newUser = await userModel.create({name:profile.displayName,email:profile.emails[0].value})
          newUser.save();
          return cb(null,newUser);
      }

}));


router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/home',
  failureRedirect: '/login'
}));

// google auth

//multer profileimg code start

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploadPimg')
  },
  filename: function (req, file, cb) {
     crypto.randomBytes(14,function(err,buff){
    let fnn =  buff.toString("hex") + path.extname(file.originalname);
      cb(null, fnn)
    })
  }
})

const upload = multer({ storage: storage })

router.post('/uploadPrfl',upload.single("pfilenames"),function(req, res){
  console.log(req.file.filename);
  userModel.findOne({username: req.user.username })
  .then(function(loggedinuser){
     loggedinuser.profileimg = req.file.filename;
     loggedinuser.save()
     .then(function(){
       res.redirect("/home")
     })
  })
});

const uploads = multer({
  dest: "./public/images/uploads", // "uploads"
});

var ImageKit = require("imagekit");
const folder = require("./folder");
const post = require("./post");
const { url } = require("inspector");

var imagekit = new ImageKit({
  publicKey: "public_SFy6gT0W6imMY2A95iAOgUrBhOY=",
  privateKey: "private_CC+im+8FRnm62hHC9Ovv8H1C5pY=",
  urlEndpoint: "https://ik.imagekit.io/9zww7jzg2",
});

/* GET home page. */


router.get("/home", isLoggedIn, async function (req, res) {
  try {
    let user = await userModel
    .findOne({ username: req.user.username })
    .populate("folder")
    .populate("posts");
    const post = await user.posts;
    const randomSubset = getRandomSubset(post, 4); // Change 5 to the desired number of users to display
      let userPics = await userModel
      .findOne({ username: req.user.username })
      .populate("folder")
      .populate("posts");
      let userM = await userModel
      .findOne({ username: req.user.username })
      .populate("folder")
      .populate("posts");
    res.render("home", {
      user: user,
       userPics: randomSubset,
       userM:userM
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get('/storage',async function(req,res){
   let user = await userModel.findOne({username:req.user.username}).populate("posts").populate('folder')
   res.render("storage",{user})
})
// Function to get a random subset of users
function getRandomSubset(array, size) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

router.get('/removeprimg',async function(req,res){
   let user = await userModel.findOne({username:req.user.username});
   user.profileimg = '';
   user.save();
   res.redirect("back");
})

router.post("/upload", uploads.single("filename"), (req, res) => {
  fs.readFile(
    "./public/images/uploads/" + req.file.filename,
    function (err, data) {
      console.log(req.file.originalname)
      if (err) throw err; // Fail if the file can't be read.
      imagekit.upload(
        {
          file: data, //required
          fileName: req.file.originalname , //required
          // fileName: req.file.originalname + ".jpg", //required
          folder: "drive",
          tags: ["tag1", "tag2"],
        },
        async function (error, result) {
          if (error) {
            console.log(error);
          } else {
            console.log(result);
            console.log("url is ");
            console.log("url is " + result.url);
            const user = await userModel.findOne({
              username: req.user.username,
            });
            console.log(user._id);
            let findPost = await postModel.findOne({originalName: req.file.originalname});
            if(findPost){
              return res.redirect('back')
            }else{
              var uri = result.url;
              var extension = uri.substring(uri.lastIndexOf(".") + 1);
              var post = await postModel.create({
                userid: user._id,
                pic: result.url,
                picId:result._id,
                ext : extension,
                picSize: result.size,
                picName: result.name,
                originalName: req.file.originalname,
                fileId:result.fileId
              });
              user.posts.push(post);
                user.recent.push(post);
            }
           
            // console.log("ext is = ");
            // console.log(extension);
            post.uploadTime = post.createdAt.getDate();
            post.expiringTime = post.createdAt.getDate() - 1;
            await post.save();
            await user.save();
            return res.redirect("/home");
          }
        }
      );
    }
  );
});

router.get("/details/:id", isLoggedIn, async function (req, res) {
  try {
    let user = await userModel
    .findOne({ username: req.user.username })
    .populate("folder")
    .populate("posts");
    const post = await user.posts;
    const randomSubset = getRandomSubset(post, 4); // Change 5 to the desired number of users to display
      let userPics = await userModel
      .findOne({ username: req.user.username })
      .populate("folder")
      .populate("posts");
      let userM = await userModel
      .findOne({ username: req.user.username })
      .populate("folder")
      .populate("posts");
      let post1 = await postModel.findOne({_id:req.params.id})
  var file_id = post1.fileId;
  console.log(post1.fileId,"its file id");
  imagekit.getFileDetails(post1.fileId, function(error, result) {
    if(error) console.log(error,"its an error occuring while processing");
    else{
      var rs = result
    } console.log(rs,"its a reesult");
  });
    res.render("homed", {
      user: user,
       userPics: randomSubset,
       userM:userM,
       post:post,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// router.get('/details/:id',async function(req,res){
//   let post = await postModel.findOne({_id:req.params.id});
//   console.log(post);
//   // Retrieve file details
//   const getFileDetails = async (fileId) => {
//     try {
//       const file = await imagekit.getFileDetails(fileId);
//       console.log('File details:', file);
//     } catch (error) {
//       console.error('Error retrieving file details:', error);
//     }
//   };
//   // Usage example
//   getFileDetails('6479a55606370748f20075e7');
//   // res.render("temp",{post})
// })

router.get("/profile", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.user.username })
    .then(function (user) {
      res.render("home", { user });
    });
});

router.get("/starred/:id", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.user.username })
    .then(function (loggedinuser) {
      loggedinuser.starred.push(req.params.id);
      loggedinuser.save().then(function () {
        res.redirect("back");
      });
    });
});

router.get("/remove/starred/:id", isLoggedIn, function (req, res) {
  userModel
    .findOne({ username: req.user.username })
    .then(function (loggedinuser) {
      var index = loggedinuser.starred.indexOf(req.params.id);
      loggedinuser.starred.splice(index, 1);
      loggedinuser.save().then(function () {
        res.redirect("back");
      });
    });
});

router.get("/starred",async function (req, res, next) {
  
  let user = await userModel.findOne({ username:req.user.username }).populate("starred").populate("starredFolder")
   await user.save();
      res.render("starred", { user });
});

router.get("/trash",async function (req, res, next) {
 let user = await userModel.findOne({ username: req.user.username }).populate("trash").populate("trashFolder")
  await user.save(); 
      res.render("trash", { user });   
});

router.get("/recent", function (req, res) {
  userModel
    .findOne({ username: req.user.username })
    .populate("recent")
    .then(function (user) {
      res.render("recent", { user });
    });
});

router.get("/trash/:id", isLoggedIn, function (req, res) {
  
  userModel.findOne({ username: req.user.username })
    .then(function (loggedinuser) {
      loggedinuser.trash.push(req.params.id);
      console.log("indes is");
      console.log(req.params.id);
      var index = loggedinuser.posts.indexOf(req.params.id);
      loggedinuser.posts.splice(index, 1);
      loggedinuser.save().then(function () {
        res.redirect("back");
      });
    });

});

router.get("/back", function (req, res) {
  res.redirect("back");
});


// update user
router.post("/updateinfo", isLoggedIn, function (req, res) {
  userModel.findOneAndUpdate(
      { username: req.user.username },
      {
        name: req.body.name,
        email: req.body.email,
        Phone: req.body.phone,
        Gender: req.body.gender,
        Birthday:req.body.dob,
        Home:req.body.add
      }
    )
    .then(function () {
      res.redirect("/home");
    });
});

router.get("/editinfo", isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.user.username }).then(function (data) {
    res.render("edit", { data });
  });
});

// update user

// update post

router.get('/updatePost/:id',async function(req,res){
  let user = await userModel.findOne({username:req.user.username}).populate("folder").populate("posts")
  let post = await postModel.findOne({_id:req.params.id})
  // console.log(folder,"kjfkjkjkj");
  await user.save();
  // await folder.save();
  res.render("homep", {user,post}); 
})

router.post('/updatepst',async function(req,res){
let user = await userModel.findOne({username:req.user.username}).populate("folder").populate("posts")
let post1 = await postModel.findOneAndUpdate({originalName:req.body.id},{
      originalName : req.body.originalname
})
console.log(post1,"kjfkjkjkj");
console.log(req.body.id);
await user.save();
res.redirect("/home");
})

// update post
router.get("/restore/:id", isLoggedIn, function (req, res) {
userModel
.findOne({ username: req.user.username })
.then(function (loggedinuser) {
  var index = loggedinuser.trash.indexOf(req.params.id);
  loggedinuser.trash.splice(index, 1);
  loggedinuser.posts.push(req.params.id);
  loggedinuser.save().then(function () {
    res.redirect("back");
  });
});
});

let previousURL = '';
router.get("/starimg/:id",isLoggedIn,async function (req, res) {
  previousURL = req.headers.referer || '';
  console.log(previousURL,"jkdhdkjhdkj");
  let user = await userModel.findOne({username:req.user.username}).populate('posts')
  let folder = await  postModel.findOne({ _id: req.params.id })
  res.render("img", { user, folder ,previousURL});
});

router.get("/starredimg/:id",isLoggedIn,async function (req, res) {
  let user = await userModel.findOne({username:req.user.username}).populate('starred')
  let folder = await  postModel.findOne({ _id: req.params.id })
  res.render("simg", { user, folder});
});

router.get("/recentimg/:id",isLoggedIn,async function (req, res) {
  let user = await userModel.findOne({username:req.user.username}).populate('recent')
  let folder = await  postModel.findOne({ _id: req.params.id })
  res.render("rimg", { user, folder});
});

let previousURL1 = '';
router.get("/folderimg/:id",isLoggedIn,async function (req, res) {
  previousURL1 = req.headers.referer || '';
  prurl = previousURL1.replace('http://localhost:3000/folders/','');
  console.log(prurl,"its a url you can use now !0");
  let user = await userModel.findOne({username:req.user.username})
  let dir = await folderModel.findOne({folderName:prurl}).populate('fposts')
  console.log(dir,"its a folder");
  let folder = await  postModel.findOne({ _id: req.params.id })
  res.render("fimg", { user, folder,dir});
});

  // folder code start

  // create folder

  //restore folders

  router.get("/restorefolder/:id", isLoggedIn, function (req, res) {
    userModel
    .findOne({ username: req.user.username })
    .then(function (loggedinuser) {
      var index = loggedinuser.trash.indexOf(req.params.id);
      loggedinuser.trashFolder.splice(index, 1);
      loggedinuser.folder.push(req.params.id);
      loggedinuser.save().then(function () {
        res.redirect("back");
      });
    });
    }); 

  //restore folders

  router.post("/createfolder",async function (req, res) {
    let user = await userModel.findOne({username:req.user.username})
    let fldr = await folderModel.findOne({folderName:req.body.folders})  
          if(fldr){
            console.log("kuch hai!")
            console.log(fldr);
            return res.redirect('back')
          }
          else{
              imagekit.createFolder({
              folderName: `${req.body.folders}`,
              parentFolderPath: `${foldername}`
            },async function(error, result) {
              console.log(result,"its your result");
            if(error) console.log(error);
            else {
              const user = await userModel.findOne({
                username: req.user.username,
              });
              let folder = await folderModel.create({
                userid: user._id,
                folderName: req.body.folders,
              });
              user.folder.push(folder);
              await folder.save();
              await user.save();
              return res.redirect("/home");
            }
            });
          }
  }); 

  // create folder
  //starred folder
  router.get("/starredfolder/:id", isLoggedIn, function (req, res) {
  
    userModel.findOne({ username: req.user.username })
      .then(function (loggedinuser) {
        loggedinuser.starredFolder.push(req.params.id);
        loggedinuser.save().then(function () {
          res.redirect("back");
        });
     });
  });
  //starred fokder

  //remove trash

  router.get("/remove/starredfolder/:id", isLoggedIn, function (req, res) {
    userModel
      .findOne({ username: req.user.username })
      .then(function (loggedinuser) {
        var index = loggedinuser.starredFolder.indexOf(req.params.id);
        loggedinuser.starredFolder.splice(index, 1);
        loggedinuser.save().then(function () {
          res.redirect("back");
        });
      });
  }); 

  //remove trash
  //trashfolder

  router.get("/trashfolder/:id", isLoggedIn, function (req, res) {
  
    userModel.findOne({username: req.user.username })
      .then(function (loggedinuser) {
        loggedinuser.trashFolder.push(req.params.id);
        console.log("index is =");
        console.log(req.params.id);
        var index = loggedinuser.folder.indexOf(req.params.id);
        loggedinuser.folder.splice(index, 1);
        loggedinuser.save()
        .then(function () {
          res.redirect("back");
        });
      });
  
  });
  //trashfolder

  //delete folder

  router.get('/deletefolder',async function(req,res){

    const user = await userModel.findOne({
       username: req.user.username,
    });
    var index = user.folder.indexOf(req.params.id);
    user.trashFolder.splice(0, user.trashFolder.length);
    user.trash.splice(0, user.trash.length);
    user.save().then(function () {
      res.redirect("trash");
    });
  
  })

  //delete folder

//folder post upload

router.post("/upload/:folderName", uploads.single("filenamef"), (req, res) => {
  const folderName = req.params.folderName;
  console.log(folderName,"its folder");
  fs.readFile(
    "./public/images/uploads/" + req.file.filename,
    function (err, data) {
      console.log(req.file.originalname)
      if (err) throw err; // Fail if the file can't be read.
      imagekit.upload(
        {
          file: data, //required
          fileName: req.file.originalname , //required
          // fileName: req.file.originalname + ".jpg", //required
          folder: `/folders/${folderName}`,
          tags: ["tag1", "tag2"],
        },
        async function (error, result) {
          if (error) {
            console.log(error);
          } else {
            // console.log(result);
            // console.log("url is ");
            // console.log("url is " + result.url);
            const user = await userModel.findOne({
              username: req.user.username,
            });
            const folder = await folderModel.findOne({
               folderName:folderName,
            });
            console.log(folder,"its folder");
            console.log(user._id);
            let findPost = await postModel.findOne({originalName: req.file.originalname});
            if(findPost){
              return res.redirect('back')
            }else{
              var uri = result.url;
              var extension = uri.substring(uri.lastIndexOf(".") + 1);
              var post = await postModel.create({
                userid: user._id,
                folderid:folder._id,
                pic: result.url,
                picId:result._id,
                ext : extension,
                picSize: result.size,
                picName: result.name,
                originalName: req.file.originalname,
                fileId:result.fileId
              });
              folder.fposts.push(post);
              // user.recent.push(post);
            }
           
            // console.log("ext is = ");
            console.log("heyeyeyeyeyeyeyeyyeey");
            post.uploadTime = post.createdAt.getDate();
            post.expiringTime = post.createdAt.getDate() - 1;
            await post.save();
            await user.save();
            await folder.save();
            return res.redirect("back");
          }
        }
      );
    }
  );
});

router.post("/createfolder/:folderName",async function (req, res) {
  const refererUrl = req.headers.referer || req.headers.referrer;
  const currentUrl = refererUrl.replace('http://localhost:3000', '');
  console.log(currentUrl);
  var folder = req.params.folderName;
  let user = await userModel.findOne({username:req.user.username})
  let fldr = await folderModel.findOne({folderName:req.body.ffolders}) 

        if(fldr){
          console.log("kuch hai!")
          console.log(fldr);
          return res.redirect('back')
        }
        else{
            imagekit.createFolder({
            folderName: `${req.body.ffolders}`,
            parentFolderPath: `/folders/${folder}`
            // parentFolderPath: `/currentUrl`
          },async function(error, result) {
          if(error) console.log(error);
          else {
            const user = await userModel.findOne({
              username: req.user.username,
            });
            const folders = await folderModel.findOne({
              folderName:folder,
            });
            let folder1 = await folderModel.create({
              userid: user._id,
              folderName: req.body.ffolders,
            });
            folders.ffolder.push(folder1);
            await folders.save();
            await user.save();
  // console.log(foldername/folder,"kjdhjkfkjfhekhdk"); 
            return res.redirect("back");
          }
          });
        }
}); 
//folder post upload

router.get("/folders/:id", isLoggedIn,async function (req, res) {

let user =await userModel.findOne({ username: req.user.username }).populate('folder')
let folderd = await folderModel.findOne({ folderName:req.params.id}).populate('fposts').populate('ffolder');
// console.log(folderd);
// console.log("folderNAme is " + chutiya);
res.render("folderv", { user, folderd });

});

// update folder

router.get('/updateFolder/:id',async function(req,res){
  let user = await userModel.findOne({username:req.user.username}).populate("folder").populate("posts")
  let folder = await folderModel.findOne({_id:req.params.id})
  // console.log(folder,"kjfkjkjkj");
  await user.save();
  // await folder.save();
  res.render("homet", {user,folder}); 
})

router.post('/updatefldr',async function(req,res){
let user = await userModel.findOne({username:req.user.username}).populate("folder").populate("posts")
let folder1 = await folderModel.findOneAndUpdate({folderName:req.body.id},{
      folderName : req.body.foldername
})
console.log(folder1,"kjfkjkjkj");
console.log(req.body.id);
await user.save();
res.redirect("/home");
})

// update folder

// folder code end


// search indexjs

router.post("/searchUser", async function (req, res, next) {
  var search = "";
  if (req.body.search) {
    search = req.body.search;
  }
  console.log(req.body.search,"its a search");
  var data = await postModel.find({
    originalName: { $regex: ".*" + search + ".*", $options: "i" },
  });
  res.status(200).send({ success: true, data: data });
});

router.get("/user/:name", async function (req, res, next) {
  const previousPage = req.params.name;
  let user = await userModel.findOne({
    username: req.user.username,
  });
  let second_user = await userModel
    .findOne({ name: req.params.name })
    .populate("posts");
  res.render("UserProfile", { user, second_user, previousPage });
});

// search indexjs
  
router.get('/success', function(req, res) {
  res.send('logged in!');
});
router.get('/failed', function(req, res) {
  res.send('logged in failed!');
});

router.get('/', function(req, res) {
  
  console.log(req.originalUrl,"url sisis");
  res.render('loginM');
});

router.get('/sign', function(req, res) {

  res.render('signM');
});

router.post('/register',function(req, res){
  var userdata = new userModel({
    username:req.body.username,
    email:req.body.email,
    name:req.body.name,
  })
  userModel.register(userdata, req.body.password)
   .then(function(u){
     passport.authenticate('local')(req, res, function(){
       res.redirect('/home')
     })
  })
})

router.post("/login",passport.authenticate('local',{
  successRedirect:'/home',
  failureRedirect:'/failed'

}),function(req, res){} ); 

router.get('/logout',function(req, res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}


// forgot pass

router.get("/forgot", function (req, res) {
  res.render("forgot");
});

router.post("/forgot", async function (req, res) {
  let user = await userModel.findOne({ email: req.body.email });
  if (user) {
    crypto.randomBytes(17, async function (err, buff) {
      var rnstr = buff.toString("hex");
      (user.token = rnstr), (user.expiringTime = Date.now() + 3000000);
      await user.save();
      mailer(req.body.email, user._id, rnstr).then(function () {
        console.log("send mail!");
      });
    });
  } else {
    res.send("no account!");
  }
});

router.get("/reset/:userid/:token", async function (req, res) {
  let user = await userModel.findOne({ _id: req.params.userid });

  if (user.token === req.params.token && user.expiringTime > Date.now()) {
    res.render("newpass", { id: req.params.userid });
  } else {
    res.send("link expired!");
  }
});

router.post("/reset/:id", async function (req, res) {
  let user = await userModel.findOne({ _id: req.params.id });
  user.setPassword(req.body.newpassword, async function () {
    user.otp = "";
    await user.save();
    res.redirect("/profile");
  });
});

// forgot pass



//chat gpt


// Function to update users periodically
function updateUsers() {
  userModel.find({}, (err, users) => {
    if (err) {
      console.error(err);
      return;
    }

    users.forEach(user => {
      user.save(err => {
        if (err) {
          console.error(err);
        }
      });
    });
  });
}

// Run the update function every 20 minutes
setInterval(updateUsers, 20 * 60 * 1000);


//chat gpt

module.exports = router;
