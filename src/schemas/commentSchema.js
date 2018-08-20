import mongoose from 'mongoose';

const commentSchema = mongoose.Schema({
  comment: String,
  creator: {type: mongoose.Schema.Types.ObjectId, ref: "User" },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;