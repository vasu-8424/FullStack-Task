const express = require('express');
const { authMiddleware } = require('../utils/auth.middleware');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

async function ensureCustomerOwnership(req, res, next) {
  try {
    const customer = await Customer.findOne({ _id: req.params.customerId, ownerId: req.user.id });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    req.customer = customer;
    next();
  } catch (err) { next(err); }
}

router.use('/:customerId/leads', ensureCustomerOwnership);

// POST /customers/:customerId/leads
router.post('/:customerId/leads', async (req, res, next) => {
  try {
    const { title, description, status, value } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const lead = await Lead.create({
      customerId: req.params.customerId,
      title,
      description,
      status,
      value,
    });
    res.status(201).json(lead);
  } catch (err) { next(err); }
});

// GET /customers/:customerId/leads?status=
router.get('/:customerId/leads', async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { customerId: req.params.customerId };
    if (status) filter.status = status;
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) { next(err); }
});

// PUT /customers/:customerId/leads/:leadId
router.put('/:customerId/leads/:leadId', async (req, res, next) => {
  try {
    const { title, description, status, value } = req.body;
    const updated = await Lead.findOneAndUpdate(
      { _id: req.params.leadId, customerId: req.params.customerId },
      { title, description, status, value },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Lead not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /customers/:customerId/leads/:leadId
router.delete('/:customerId/leads/:leadId', async (req, res, next) => {
  try {
    const deleted = await Lead.findOneAndDelete({ _id: req.params.leadId, customerId: req.params.customerId });
    if (!deleted) return res.status(404).json({ message: 'Lead not found' });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;


