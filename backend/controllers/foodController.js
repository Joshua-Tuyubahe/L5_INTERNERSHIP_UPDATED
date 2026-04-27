const Food = require('../models/Food');

async function getFood(req, res) {
  try {
    const foods = await Food.find();
    return res.json(foods);
  } catch (error) {
    console.error('Get food error:', error);
    return res.status(500).json({ message: 'Server error loading food items' });
  }
}

async function addFood(req, res) {
  try {
    const { name, price } = req.body;
    if (!name || typeof price !== 'number') {
      return res.status(400).json({ message: 'Food name and numeric price are required' });
    }

    const food = await Food.create({ name, price });
    return res.status(201).json({ message: 'Food item added', food });
  } catch (error) {
    console.error('Add food error:', error);
    return res.status(500).json({ message: 'Server error adding food item' });
  }
}

module.exports = { getFood, addFood };
