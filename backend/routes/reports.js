const express = require('express');
const { getReports } = require('../controllers/reportController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, getReports);

module.exports = router;