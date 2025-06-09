const Sale = require('../models/Sale');
const SparePart = require('../models/SparePart');
const mongoose = require('mongoose');

// Create a new sale
exports.createSale = async (req, res) => {
  try {
    const { items, customerName } = req.body;
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    // Calculate total amount and validate stock
    let totalAmount = 0;
    const itemsToSell = [];
    
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
      const { sparePart: sparePartId, quantity } = item;
      
      // Validate item
      if (!sparePartId || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid item data' });
      }
      
      // Get spare part from map
      const sparePart = sparePartMap.get(sparePartId);
      if (!sparePart) {
        return res.status(404).json({ message: `Spare part not found: ${sparePartId}` });
      }
      
      if (sparePart.quantity < quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${sparePart.name}. Available: ${sparePart.quantity}` 
        });
      }
      
      // Add to items to sell
      itemsToSell.push({
        sparePart: sparePart._id,
        quantity,
        price: sparePart.price
      });
      
      totalAmount += sparePart.price * quantity;
    }
    
    // Create sale
    const sale = new Sale({
      items: itemsToSell,
      totalAmount,
      customerName: customerName || 'ناشناس',
      date: new Date()
    });
    
    // Save sale - this will trigger the post-save hook to update quantities
    await sale.save();
    
    // Populate the sale data for response
    const populatedSale = await Sale.findById(sale._id)
      .populate('items.sparePart', 'name brand price')
      .lean();
    
    res.status(201).json({
      message: 'Sale created successfully',
      sale: populatedSale
    });
    
  } catch (error) {
    console.error('Error in createSale:', error);
    
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
      message: 'Error creating sale', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all sales with pagination
exports.getSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [sales, total] = await Promise.all([
      Sale.find()
        .populate('items.sparePart', 'name brand price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Sale.countDocuments()
    ]);
    
    res.json({
      sales,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSales: total
    });
    
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ 
      message: 'Error fetching sales', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.sparePart', 'name brand price');
      
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json(sale);
    
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ 
      message: 'Error fetching sale', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get sales summary (for dashboard)
exports.getSalesSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalSales, todaySales, totalAmountResult, todayAmountResult] = await Promise.all([
      Sale.countDocuments(),
      Sale.countDocuments({ date: { $gte: today } }),
      Sale.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      Sale.aggregate([
        {
          $match: { date: { $gte: today } }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ])
    ]);
    
    res.json({
      totalSales,
      todaySales,
      totalAmount: totalAmountResult[0]?.total || 0,
      todayAmount: todayAmountResult[0]?.total || 0
    });
    
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ 
      message: 'Error fetching sales summary', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete a sale and restore stock
exports.deleteSale = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the sale first to get the items
        const sale = await Sale.findById(id);
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Restore the stock quantities
        const bulkOps = sale.items.map(item => ({
            updateOne: {
                filter: { _id: item.sparePart },
                update: { $inc: { quantity: item.quantity } }
            }
        }));

        if (bulkOps.length > 0) {
            await SparePart.bulkWrite(bulkOps);
        }

        // Delete the sale
        await Sale.findByIdAndDelete(id);
        
        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({ 
            message: 'Error deleting sale', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};
