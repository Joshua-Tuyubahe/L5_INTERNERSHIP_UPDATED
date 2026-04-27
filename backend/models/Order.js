const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodName: { type: String, required: true },
    price: { type: Number, required: true }, // Unit price
    quantity: { type: Number, default: 1, min: 1 },
    totalPrice: { type: Number, default: function() { return this.price * this.quantity; } }, // price * quantity
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Delivered'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
