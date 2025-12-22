const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/sales', reportController.getSalesReport);
router.get('/sales/export', reportController.exportSalesReport);
router.get('/leads-by-status', reportController.getLeadsByStatus);

module.exports = router;