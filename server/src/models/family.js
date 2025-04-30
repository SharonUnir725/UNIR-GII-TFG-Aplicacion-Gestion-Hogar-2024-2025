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
  },
  members: [{
    type: Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para contar miembros
FamilySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

module.exports = model('Family', FamilySchema);
