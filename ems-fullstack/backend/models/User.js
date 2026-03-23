// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  eid:        { type: String, unique: true },
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6, select: false },
  role:       { type: String, enum: ['employee','manager','hr','admin','ceo'], default: 'employee' },
  dept:       { type: String, default: '' },
  title:      { type: String, default: 'Employee' },
  phone:      { type: String, default: '' },
  joinDate:   { type: String, default: '' },
  salary:     { type: Number, default: 50000 },
  managerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bankAcc:    { type: String, default: '—' },
  address:    { type: String, default: '—' },
  photo:      { type: String, default: null },   // base64 or URL
  ini:        { type: String, default: '' },
  av:         { type: String, default: 'a1' },
  c:          { type: String, default: '#3b82f6' },
  l:          { type: String, default: '#93c5fd' },
  b:          { type: String, default: 'rgba(59,130,246,.15)' },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
