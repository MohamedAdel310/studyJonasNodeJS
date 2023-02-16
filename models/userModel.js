const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userShema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please Provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photoPath: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //this only works on CREATE and SAVE!!!
      validator: function(val) {
        return val === this.password;
      },
      message: `Passwords are not the same!`
    }
  }
});

userShema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userShema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // return true or false
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userShema);

module.exports = User;
