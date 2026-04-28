const express = require('express');
const { getFood, addFood, updateFood, deleteFood, upload } = require('../controllers/foodController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getFood);
router.post('/', verifyToken, verifyAdmin, upload.single('image'), addFood);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), updateFood);
router.delete('/:id', verifyToken, verifyAdmin, deleteFood);

module.exports = router;
