const express = require('express');
const { authMiddleware } = require('../utils/auth.middleware');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

const router = express.Router();

router.use(authMiddleware);

// GET /reports/lead-status -> { statusCounts: { New: n, Contacted: n, Converted: n, Lost: n } }
router.get('/lead-status', async (req, res, next) => {
  try {
    // Only leads for customers owned by current user
    const ownedCustomerIds = await Customer.find({ ownerId: req.user.id }).distinct('_id');
    const results = await Lead.aggregate([
      { $match: { customerId: { $in: ownedCustomerIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusCounts = { New: 0, Contacted: 0, Converted: 0, Lost: 0 };
    for (const r of results) statusCounts[r._id] = r.count;
    res.json({ statusCounts });
  } catch (err) { next(err); }
});

module.exports = router;


