const mongoose = require('mongoose');

const StorePolicySchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  policyType: {
    type: String,
    enum: ['shipping', 'return', 'warranty', 'terms'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('StorePolicy', StorePolicySchema);
