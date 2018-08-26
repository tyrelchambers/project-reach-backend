import mongoose from 'mongoose';

const commentSchema = mongoose.Schema({
  comment: String,
  creator: String,
  created_at: {
    type: Date, default: Date.now()
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;