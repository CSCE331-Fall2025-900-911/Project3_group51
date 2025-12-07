const express = require('express');
const router = express.Router();
const customers = require('../customers');

// Identify or create a customer by phone/email
router.post('/identify', async (req, res) => {
  const phone = req.body.phone?.trim() || null;
  const email = req.body.email?.trim() || null;

  if (!phone && !email) {
    return res.status(400).json({ error: 'Phone or email is required' });
  }

  try {
    const customer = await customers.findCustomer({ phone, email });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({
      id: customer.customerid,
      phone: customer.phone,
      email: customer.email,
      points: customer.points ?? 0,
    });
  } catch (e) {
    console.error('Error in /customers/identify:', e);
    res.status(500).json({ error: e.message });
  }
});

// Create a customer explicitly
router.post('/create', async (req, res) => {
  const name = req.body.name?.trim() || null;
  const phone = req.body.phone?.trim() || null;
  const email = req.body.email?.trim() || null;

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Name, phone, and email are required' });
  }

  try {
    const customer = await customers.createCustomer({ name, phone, email });
    res.status(201).json({
      id: customer.customerid,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      points: customer.points ?? 0,
    });
  } catch (e) {
    console.error('Error in /customers/create:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
