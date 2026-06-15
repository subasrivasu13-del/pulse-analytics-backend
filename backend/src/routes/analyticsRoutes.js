const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const protect = require('../middlewares/auth');

const router = express.Router();

// All analytics routes require JWT authentication
router.use(protect);

router.get('/overview', analyticsController.getOverview);
router.get('/visitors', analyticsController.getVisitors);
router.get('/pageviews', analyticsController.getPageViews);
router.get('/sessions', analyticsController.getSessions);
router.get('/active-users', analyticsController.getActiveUsers);

module.exports = router;
