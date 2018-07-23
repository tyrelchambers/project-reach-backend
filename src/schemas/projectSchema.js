import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
  title: String,
  author: String,
  description: String,
  meta: {
    likes: Number,
    dislikes: Number
  },
  archived: Boolean,
  thumbnail: String,
  images: [String]
  // add comment field
  
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
