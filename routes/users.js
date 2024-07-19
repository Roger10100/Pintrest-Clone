const mongoose = require('mongoose');
const plm= require('passport-local-mongoose');
mongoose.connect("mongodb://0.0.0.0:27017/nayaapp"); 
// Define the schema for a post


// Define the schema for a user
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
}], // Array of posts
  dp:{type: String}, // URL to the display picture
  email: { type: String, required: true, unique: true },
  fullname: { type: String, required: true }
});
userSchema.plugin(plm);
// Create the User model using the schema
module.exports= mongoose.model('User', userSchema);


