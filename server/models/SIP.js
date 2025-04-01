const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['hardware', 'software'], required: true },
  specifications: Map,
  dependencies: [String]
});

const SIPSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Cars', 'Home Appliances', 'Wearables'] 
  },
  manufacturer: { type: String, required: true },
  operatingSystems: [String],
  components: [componentSchema],
  versions: [{
    version: String,
    releaseDate: Date,
    cost: Number
  }],
  supplier: String
});

// Create text index for search
SIPSchema.index({
  name: 'text',
  category: 'text',
  manufacturer: 'text',
  'components.name': 'text'
});

module.exports = mongoose.model('SIP', SIPSchema);