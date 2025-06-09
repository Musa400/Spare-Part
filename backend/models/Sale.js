const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  sparePart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SparePart',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const SaleSchema = new mongoose.Schema({
  items: [SaleItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  customerName: {
    type: String,
    default: 'ناشناس' // Default customer name if not provided
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update spare part quantities after a sale
SaleSchema.post('save', async function(doc) {
  const SparePart = mongoose.model('SparePart');
  
  for (const item of doc.items) {
    await SparePart.findByIdAndUpdate(
      item.sparePart,
      { $inc: { quantity: -item.quantity } },
      { new: true, session: doc.$session() }
    );
  }
});

module.exports = mongoose.model('Sale', SaleSchema);
