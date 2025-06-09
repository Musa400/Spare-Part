const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// Create a new purchase
router.post('/', purchaseController.createPurchase);

// Get all purchases with pagination
router.get('/', purchaseController.getPurchases);

// Get purchase by ID
router.get('/:id', purchaseController.getPurchaseById);

// Delete a purchase
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;
