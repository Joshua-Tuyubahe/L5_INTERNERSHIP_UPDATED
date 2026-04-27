const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', FoodSchema);
