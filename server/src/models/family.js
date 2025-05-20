// server/src/models/family.js
const { Schema, model, Types } = require('mongoose');

const FamilySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = model('Family', FamilySchema);
