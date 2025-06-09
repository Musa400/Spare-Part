const express = require('express');
const router = express.Router();
const sparePartsController = require('../controllers/sparePartController');

router.get('/', sparePartsController.getAllSpareParts);
router.post('/', sparePartsController.createSparePart);
router.put('/:id', sparePartsController.updateSparePart);
router.delete('/:id', sparePartsController.deleteSparePart);

module.exports = router;
