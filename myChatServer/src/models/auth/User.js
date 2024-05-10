const mongoose = require("mongoose");

const passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  isOnline: {
    type: Boolean,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

const User = mongoose.model("User", userSchema);

module.exports = User;
