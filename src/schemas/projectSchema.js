import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
  title: String,
  author: String,
  description: String,
  meta: {
    likes: Int,
    dislikes: Int
  },
  archived: Boolean,
  thumbnail: String,
  images: [String]
  // add comment field
  
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
