const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    image: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', FoodSchema);
