const Feedback = require('../models/Feedback');
const User = require('../models/User');

async function createFeedback(req, res) {
  try {
    const { type, rating, message } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!type || !rating || !message) {
      return res.status(400).json({ message: 'Type, rating, and message are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const feedback = new Feedback({
      userId,
      type,
      rating,
      message
    });

    await feedback.save();

    return res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Create feedback error:', error);
    return res.status(500).json({ message: 'Server error creating feedback' });
  }
}

async function getFeedbacks(req, res) {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return res.json(feedbacks);
  } catch (error) {
    console.error('Get feedbacks error:', error);
    return res.status(500).json({ message: 'Server error loading feedbacks' });
  }
}

module.exports = { createFeedback, getFeedbacks };