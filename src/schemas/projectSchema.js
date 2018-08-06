import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
  title: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
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
