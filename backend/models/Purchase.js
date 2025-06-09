const mongoose = require('mongoose');

const PurchaseItemSchema = new mongoose.Schema({
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

const PurchaseSchema = new mongoose.Schema({
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  items: [PurchaseItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update spare part quantities after a purchase
PurchaseSchema.post('save', async function(doc) {
  const SparePart = mongoose.model('SparePart');
  
  for (const item of doc.items) {
    await SparePart.findByIdAndUpdate(
      item.sparePart,
      { $inc: { quantity: item.quantity } },
      { new: true }
    );
  }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
