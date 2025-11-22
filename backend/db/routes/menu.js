const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../pool');
const router = express.Router();
const IMAGES_DIR = path.join(__dirname, '..', '..', 'images');

// All menu items
router.get('/', async (_, res) => {
  try {
    const r = await pool.query('SELECT * FROM menuitem ORDER BY drinkid');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Drink price
router.get('/:id/price', async (req, res) => {
  try {
    const r = await pool.query('SELECT price FROM menuitem WHERE drinkid=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).send('Not found');
    res.json({ price: r.rows[0].price });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create
router.post('/', async (req, res) => {
  const { drinkname, category, ingredient, price, image } = req.body;
  try {
    const next = await pool.query('SELECT COALESCE(MAX(drinkid),0)+1 AS next FROM menuitem');
    const id = next.rows[0].next;
    await pool.query(
      'INSERT INTO menuitem (drinkid, drinkname, category, ingredient, price, image) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, drinkname, category, ingredient, price, image || null]
    );
    res.status(201).json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update
router.put('/:id', async (req, res) => {
  const { drinkname, category, ingredient, price, image } = req.body;
  try {
    await pool.query(
      'UPDATE menuitem SET drinkname=$1, category=$2, ingredient=$3, price=$4, image=$5 WHERE drinkid=$6',
      [drinkname, category, ingredient, price, image || null, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM stock WHERE drinkid=$1', [req.params.id]);
    await pool.query('DELETE FROM menuitem WHERE drinkid=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Upload image (expects { filename, data } where data is base64)
router.post('/upload-image', async (req, res) => {
  const { filename, data } = req.body || {};
  if (!filename || !data) {
    return res.status(400).json({ error: 'filename and data are required' });
  }
  const safeName = path.basename(filename);
  const targetPath = path.join(IMAGES_DIR, safeName);
  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(targetPath, buffer);
    res.json({ filename: safeName });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
