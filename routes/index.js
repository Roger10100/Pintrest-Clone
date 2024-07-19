var express = require('express');
var router = express.Router();
const userModel= require("./users");
const postModel= require("./posts");
const passport= require('passport');
const localStrategy= require("passport-local").Strategy;
const upload= require('./multer');
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login',function(req,res,next){
  
  res.render('login',{error:req.flash('error')});
});
router.get('/profile',isloggedin,async function(req,res,next){
  const user =await userModel.findOne({
    username:req.session.passport.user
  })
  .populate("posts")
  // console.log(user);
   res.render('profile',{user});
});

router.get('/feed',function(req,res,next){
  res.render('feed')
});
// router.post("/register", function(req, res) {
//   const { username, email, fullname } = req.body;
  
//   const userdata = new userModel({ username, email, fullname });
//   userModel.register(userdata,req.body.password)
//   .then(function(){
//     passport.authenticate("local")(req,res,function(){
//       res.redirect("/profile");

//     })
//   });
//   })
router.post("/register", function(req, res) {
  const { username, email, fullname, password } = req.body;
  
  const userdata = new userModel({ username, email, fullname });
  userModel.register(userdata, password)
  .then(function() {
    passport.authenticate("local")(req, res, function() {
      res.redirect("/profile");
    });
  })
  .catch(function(err) {
    res.status(500).send(err);
  });
});

router.post("/login",passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true,
}),function(req,res){
    


});
router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});
function isloggedin(req,res,next){
  if(req.isAuthenticated()){
    return next();}
    else{
    res.redirect("/login")
    }
};

router.post('/upload',isloggedin,upload.single("file"),async function(req,res,next){
  if(!req.file){
    res.send("No file uploaded");
  }
  else{
    // res.send(req.file);
    const user =await userModel.findOne({username:req.session.passport.user});
   const post= await postModel.create({
      image: req.file.filename,
      imagetext: req.body.filecaption,
      user: user._id
    });
     user.posts.push(post._id);
     await user.save();
    res.send("file uploaded succefully");
    // res.redirect("/profile")
    //save as post and uska post id user ko do and post ko user id do

  } 
});
router.post('/posts/:id/comment', isloggedin, async function(req, res, next) {
  try {
    const post = await postModel.findById(req.params.id);
    const newComment = {
      user: req.user._id,
      text: req.body.text
    };
    post.comments.push(newComment);
    await post.save();
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});
router.post('/posts/:id/like', isloggedin, async function(req, res, next) {
  try {
    const post = await postModel.findById(req.params.id);
    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Add like
      post.likes.push(userId);
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Route to display individual post
router.get('/post/:id', isloggedin, async function(req, res, next) {
  try {
    const postId = req.params.id;
    const post = await postModel.findById(postId)
                                .populate('user')
                                .populate({
                                  path: 'comments',
                                  populate: { path: 'user' }
                                });
    
    if (!post) {
      return res.status(404).send('Post not found');
    }
    
    res.render('post', { post: post, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

    




module.exports = router;
