const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Please provide username'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide password']
  }
});

UserSchema.plugin(uniqueValidator);

// Hash du mot de passe avant l'enregistrement
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
