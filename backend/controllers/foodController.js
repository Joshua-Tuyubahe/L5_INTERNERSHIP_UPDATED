const Food = require('../models/Food');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

async function getFood(req, res) {
  try {
    const foods = await Food.find();
    // Add full URL for images
    const foodsWithImages = foods.map(food => ({
      ...food.toObject(),
      image: food.image ? `${req.protocol}://${req.get('host')}/uploads/${food.image}` : null
    }));
    return res.json(foodsWithImages);
  } catch (error) {
    console.error('Get food error:', error);
    return res.status(500).json({ message: 'Server error loading food items' });
  }
}

async function addFood(req, res) {
  try {
    const { name, price } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Food name is required' });
    }

    const numericPrice = parseFloat(price);
    if (!price || isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'Valid numeric price is required' });
    }

    const foodData = {
      name: name.trim(),
      price: numericPrice
    };

    // Add image if uploaded
    if (req.file) {
      foodData.image = req.file.filename;
    }

    const food = await Food.create(foodData);
    return res.status(201).json({
      message: 'Food item added successfully',
      food: {
        ...food.toObject(),
        image: food.image ? `${req.protocol}://${req.get('host')}/uploads/${food.image}` : null
      }
    });
  } catch (error) {
    console.error('Add food error:', error);
    if (error.message.includes('Only image files are allowed!')) {
      return res.status(400).json({ message: 'Only image files (JPEG, PNG, GIF) are allowed' });
    }
    return res.status(500).json({ message: 'Server error adding food item' });
  }
}

async function updateFood(req, res) {
  try {
    const { id } = req.params;
    const { name, price, quantity } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Food name is required' });
    }

    const numericPrice = parseFloat(price);
    if (!price || isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'Valid numeric price is required' });
    }

    const updateData = {
      name: name.trim(),
      price: numericPrice
    };

    // Add quantity if provided
    if (quantity !== undefined) {
      const numericQuantity = parseInt(quantity);
      if (isNaN(numericQuantity) || numericQuantity < 0) {
        return res.status(400).json({ message: 'Quantity must be a non-negative number' });
      }
      updateData.quantity = numericQuantity;
    }

    // Add image if uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const food = await Food.findByIdAndUpdate(id, updateData, { new: true });
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    return res.json({
      message: 'Food item updated successfully',
      food: {
        ...food.toObject(),
        image: food.image ? `${req.protocol}://${req.get('host')}/uploads/${food.image}` : null
      }
    });
  } catch (error) {
    console.error('Update food error:', error);
    if (error.message.includes('Only image files are allowed!')) {
      return res.status(400).json({ message: 'Only image files (JPEG, PNG, GIF) are allowed' });
    }
    return res.status(500).json({ message: 'Server error updating food item' });
  }
}

async function deleteFood(req, res) {
  try {
    const { id } = req.params;
    const food = await Food.findByIdAndDelete(id);
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    return res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Delete food error:', error);
    return res.status(500).json({ message: 'Server error deleting food item' });
  }
}

module.exports = { getFood, addFood, updateFood, deleteFood, upload };
