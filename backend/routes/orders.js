const express = require('express');
const { createOrder, getOrders, updateOrder, deleteOrder } = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrders);
router.put('/:id', verifyToken, updateOrder);
router.delete('/:id', verifyToken, deleteOrder);

module.exports = router;
