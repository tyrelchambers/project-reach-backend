import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
  title: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  description: String,
  headline: String,
  meta: {
    likes: Number,
    dislikes: Number
  },
  archived: Boolean,
  thumbnail: String,
  images: [String],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
  created_at: {
    type: Date, default: Date.now()
  }
  
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
