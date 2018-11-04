import mongoose, { mongo } from 'mongoose';

const projectSchema = mongoose.Schema({
  title: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  description: String,
  headline: String,
  upvote: Number,
  dislikes: Number,
  archived: Boolean,
  thumbnail: String,
  images: [String],
  feedback: [{type: mongoose.Schema.Types.ObjectId, ref: "Feedback"}],
  created_at: {
    type: Date, default: Date.now()
  },
  upvoters: [String]
  
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
