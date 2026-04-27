const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['delay', 'quality', 'service', 'other'] },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);