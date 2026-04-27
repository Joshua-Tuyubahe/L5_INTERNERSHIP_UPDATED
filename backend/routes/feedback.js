const express = require('express');
const { createFeedback, getFeedbacks } = require('../controllers/feedbackController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, createFeedback);
router.get('/', verifyToken, verifyAdmin, getFeedbacks);

module.exports = router;