const mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  user_id: mongoose.Schema.ObjectId,
  email: String,
  password: String,
  username: String
});

// Add any methods before this line userSchema.methods.methodName
const User = mongoose.model("User", userSchema);

module.exports = User;