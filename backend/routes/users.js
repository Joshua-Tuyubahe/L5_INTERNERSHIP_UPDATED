const express = require('express');
const { getUsers } = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, getUsers);

module.exports = router;
