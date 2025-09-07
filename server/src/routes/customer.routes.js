const express = require('express');
const { authMiddleware } = require('../utils/auth.middleware');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');

const router = express.Router();

router.use(authMiddleware);

// POST /customers
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, company } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const exists = await Customer.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Customer email already exists' });
    const customer = await Customer.create({ name, email: email.toLowerCase(), phone, company, ownerId: req.user.id });
    res.status(201).json(customer);
  } catch (err) { next(err); }
});

// GET /customers?search=&page=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Math.min(Number(limit) || 10, 100);
    const filter = {
      ownerId: req.user.id,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    };
    const [items, total] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit),
      Customer.countDocuments(filter),
    ]);
    res.json({ items, page: numericPage, limit: numericLimit, total });
  } catch (err) { next(err); }
});

// GET /customers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!customer) return res.status(404).json({ message: 'Not found' });
    const leads = await Lead.find({ customerId: customer._id }).sort({ createdAt: -1 });
    res.json({ ...customer.toObject(), leads });
  } catch (err) { next(err); }
});

// PUT /customers/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, phone, company } = req.body;
    const updated = await Customer.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { name, email, phone, company },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /customers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Customer.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    await Lead.deleteMany({ customerId: deleted._id });
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;


