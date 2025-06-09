const mongoose = require('mongoose');

const SparePartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  carModel: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SparePart', SparePartSchema);
