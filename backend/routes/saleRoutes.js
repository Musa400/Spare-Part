const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

// Create a new sale
router.post('/', saleController.createSale);

// Get sales summary (for dashboard)
router.get('/summary', saleController.getSalesSummary);

// Get all sales with pagination
router.get('/', saleController.getSales);

// Get sale by ID - This should be the last route to avoid conflicts
router.get('/:id', saleController.getSaleById);

module.exports = router;
