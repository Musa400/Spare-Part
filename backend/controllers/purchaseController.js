const Purchase = require('../models/Purchase');
const SparePart = require('../models/SparePart');

// Create a new purchase
exports.createPurchase = async (req, res) => {
  try {
    const { supplier, items, description, companyName } = req.body;
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Calculate total amount and validate spare parts
    let totalAmount = 0;
    const itemsToPurchase = [];
    
    // Get all spare parts at once for better performance
    const sparePartIds = items.map(item => item.sparePart);
    const spareParts = await SparePart.find({
      _id: { $in: sparePartIds }
    });

    // Create a map for quick lookup
    const sparePartMap = new Map();
    spareParts.forEach(part => {
      sparePartMap.set(part._id.toString(), part);
    });

    // Process each item
    for (const item of items) {
      const { sparePart: sparePartId, quantity, price } = item;
      
      // Validate item
      if (!sparePartId || !quantity || quantity <= 0 || !price || price < 0) {
        return res.status(400).json({ message: 'Invalid item data' });
      }
      
      // Get spare part from map
      const sparePart = sparePartMap.get(sparePartId);
      if (!sparePart) {
        return res.status(404).json({ message: `Spare part not found: ${sparePartId}` });
      }
      
      // Add to items to purchase
      itemsToPurchase.push({
        sparePart: sparePart._id,
        quantity,
        price
      });
      
      totalAmount += price * quantity;
    }
    
    // Create purchase
    const purchase = new Purchase({
      supplier,
      items: itemsToPurchase,
      totalAmount,
      description: description || '',
      companyName,
      purchaseDate: req.body.purchaseDate || new Date()
    });
    
    // Save purchase - this will trigger the post-save hook to update quantities
    await purchase.save();
    
    // Populate the purchase data for response
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('items.sparePart', 'name brand')
      .lean();
    
    res.status(201).json({
      message: 'Purchase created successfully',
      purchase: populatedPurchase
    });
    
  } catch (error) {
    console.error('Error in createPurchase:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid data format',
        error: error.message 
      });
    }
    
    // Default error response
    res.status(500).json({ 
      message: 'Error creating purchase', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all purchases with pagination
exports.getPurchases = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [purchases, total] = await Promise.all([
      Purchase.find()
        .populate('items.sparePart', 'name brand')
        .sort({ purchaseDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Purchase.countDocuments()
    ]);
    
    res.json({
      purchases,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPurchases: total
    });
    
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ 
      message: 'Error fetching purchases', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get purchase by ID
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('items.sparePart', 'name brand price');
      
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    res.json(purchase);
    
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({ 
      message: 'Error fetching purchase', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete a purchase and update stock
exports.deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the purchase first to get the items
    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Update the stock quantities (decrement by the purchased quantities)
    const bulkOps = purchase.items.map(item => ({
      updateOne: {
        filter: { _id: item.sparePart },
        update: { $inc: { quantity: -item.quantity } }
      }
    }));

    if (bulkOps.length > 0) {
      await SparePart.bulkWrite(bulkOps);
    }

    // Delete the purchase
    await Purchase.findByIdAndDelete(id);
    
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    console.error('Error deleting purchase:', error);
    res.status(500).json({ 
      message: 'Error deleting purchase', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
