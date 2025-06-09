const SparePart = require('../models/SparePart');

// Get all spare parts
exports.getAllSpareParts = async (req, res) => {
  try {
    const parts = await SparePart.find().sort({ createdAt: -1 });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch spare parts' });
  }
};

// Create new spare part
exports.createSparePart = async (req, res) => {
  try {
    const newPart = new SparePart(req.body);
    await newPart.save();
    res.status(201).json(newPart);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create spare part', error });
  }
};

// Update spare part by ID
exports.updateSparePart = async (req, res) => {
  try {
    const updatedPart = await SparePart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedPart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    res.json(updatedPart);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update spare part', error });
  }
};

// Delete spare part by ID
exports.deleteSparePart = async (req, res) => {
  try {
    const deletedPart = await SparePart.findByIdAndDelete(req.params.id);
    if (!deletedPart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }
    res.json({ message: 'Spare part deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete spare part' });
  }
};
