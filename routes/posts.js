const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});



// Define the schema for a post
const postSchema = new mongoose.Schema({
  imagetext: { type: String,
     required: true },
     image:{
      type: String

     },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: { type: Date, default: Date.now },
  likes: { type: Array, default: [] },
  comments:[commentSchema]
});

// Create the Post model using the schema

module.exports = mongoose.model('Post', postSchema);


