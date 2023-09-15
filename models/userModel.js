const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A User Must Have A Name.'],
    minlength: [3, 'A User name must hame atleast 3 characters.']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'A User Must Have A Email.'],
    validate: [validator.isEmail, 'User Email Must Be A Valid Email.']
  },
  photo: {
    type: String,
    required: [false]
  },
  roles: {
    type: String,
    required: [true, 'A user must have a role assigned.'],
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'A User Must Have A Password.'],
    minlength: [8, 'A User password must be atleast 3 characters long.'],
    maxlength: [
      30,
      'A User password must be not be more then 30 characters long.'
    ],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A User Must Have Password Confirmed.'],
    validate: {
      validator: function(el) {
        return this.password === el;
      },
      message: 'Password And  Confirm Password Must Be Same.'
    }
  },
  passwordResetToken: {
    type: String,
    required: false
  },
  passwordResetExpires: {
    type: Date,
    required: false
  },
  passwordChangedAt: { type: Date, required: [false] }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  candidatepassword,
  userPassword
) {
  return await bcrypt.compare(candidatepassword, userPassword);
};

userSchema.methods.changePasswordAfter = async function(JWTTz) {
  if (this.passwordChangedAt) {
    const changesTz = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    if (JWTTz < changesTz) {
    } else {
    }
    return changesTz > JWTTz;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = async function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
