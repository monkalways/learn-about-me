const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const moment = require("moment");
const SALT_FACTOR = 10;

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  displayName: String,
  bio: String
});

userSchema.methods.name = function() {
  return this.displayName || this.username;
};

userSchema.methods.createAtStr = function() {
  return moment(this.createdAt).format("MMMM Do YYYY");
};

const noop = () => {};

userSchema.pre("save", function(done) {
  const user = this;
  if (!user.isModified("password")) {
    return done();
  }
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      return done(err);
    }
    bcrypt.hash(user.password, salt, noop, (err, hashedPassword) => {
      if (err) {
        return done(err);
      }
      user.password = hashedPassword;
      done();
    });
  });
});

userSchema.methods.checkPassword = function(guess, done) {
  bcrypt.compare(guess, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
