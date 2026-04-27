const express = require('express');
const { getFood, addFood } = require('../controllers/foodController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getFood);
router.post('/', verifyToken, verifyAdmin, addFood);

module.exports = router;
