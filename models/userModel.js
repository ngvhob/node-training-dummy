const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = mongoose.Schema({
    name : {
        type : String,
        required: [true, 'A User Must Have A Name.'],
        minlength: [3, 'A User name must hame atleast 3 characters.'],
    }, 
    email : {
        type : String,
        unique : true,
        lowercase : true,
        required: [true, 'A User Must Have A Email.'],
        validate: [validator.isEmail , 'User Email Must Be A Valid Email.']
    },
    photo : {
        type : String,
        required: [false],
    },
    password : {
        type : String,
        required: [true, 'A User Must Have A Password.'],
        minlength: [8, 'A User password must be atleast 3 characters long.'],
        maxlength: [30, 'A User password must be not be more then 30 characters long.'],
    },
    passwordConfirm : {
        type : String,
        required: [true, 'A User Must Have Password Confirmed.'],
        validate: {
            validator: function(el){
              return this.password === el
            },
            message: 'Password And  Confirm Password Must Be Same.'
          }
    },
})

userSchema.pre('save',async function (next) { 
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
 })

const User = mongoose.model('User', userSchema);
module.exports = User;