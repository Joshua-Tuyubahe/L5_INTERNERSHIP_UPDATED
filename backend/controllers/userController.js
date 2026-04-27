const User = require('../models/User');

async function getUsers(req, res) {
  try {
    const users = await User.find({}, 'name email role createdAt');
    return res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Server error loading users' });
  }
}

module.exports = { getUsers };
