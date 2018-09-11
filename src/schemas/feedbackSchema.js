import mongoose from 'mongoose';

const feedbackSchema = mongoose.Schema({
  comment: String,
  creator: String,
  created_at: {
    type: Date, default: Date.now()
  },
  interestRating: String,
  pros: [String],
  cons: [String],
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;