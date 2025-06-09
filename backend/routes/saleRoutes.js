const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

// Create a new sale
router.post('/', saleController.createSale);

// Get sales summary (for dashboard)
router.get('/summary', saleController.getSalesSummary);

// Get all sales with pagination
router.get('/', saleController.getSales);

// Get sale by ID
router.get('/:id', saleController.getSaleById);

// Delete a sale
router.delete('/:id', saleController.deleteSale);

module.exports = router;
