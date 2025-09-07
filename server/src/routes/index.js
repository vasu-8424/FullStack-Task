const express = require('express');
const { authMiddleware } = require('../utils/auth.middleware');

const customerRoutes = require('./customer.routes');
const leadRoutes = require('./lead.routes');
const reportsRoutes = require('./reports.routes');

const router = express.Router();

router.use('/customers', customerRoutes);
router.use('/customers', leadRoutes);
router.use('/reports', reportsRoutes);

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;


