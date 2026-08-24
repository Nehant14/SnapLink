const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

// GET /api/v1/analytics/:shortCode/stats , requireAuth so req.user.id is
// always set before the controller runs the ownership check.
// router.get(url_path, middleware, controller) -> middleware is placed to check the request and stop is early if
// it has any problem before going to the controller

router.get('/:shortCode/stats', requireAuth, analyticsController.getStats);

module.exports = router;
