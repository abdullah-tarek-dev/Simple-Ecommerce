const express = require('express');
const router = express.Router();
const pool = require('../db');

const allowedFunctions = new Set([
  'get_expensive_products',
  'get_admins_with_many_products',
  'get_products_with_admins',
  'get_orders_with_payments',
  'get_products_above_avg_price',
  'get_low_stock_products'
]);

const runFunction = async (funcName, args = []) => {
  if (!allowedFunctions.has(funcName)) {
    throw new Error('Function not allowed');
  }

  const placeholders = args.map((_, i) => `$${i + 1}`).join(', ');
  const query = `SELECT * FROM ${funcName}(${placeholders});`;
  const { rows } = await pool.query(query, args);
  return rows;
};

// Routes
router.get('/expensive-products', async (req, res) => {
  try {
    const rows = await runFunction('get_expensive_products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admins-with-many-products', async (req, res) => {
  try {
    const rows = await runFunction('get_admins_with_many_products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders-with-users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders_with_users();');
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /orders-with-users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/products-with-admins', async (req, res) => {
  try {
    const rows = await runFunction('get_products_with_admins');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders-with-payments', async (req, res) => {
  try {
    const rows = await runFunction('get_orders_with_payments');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products-above-average', async (req, res) => {
  try {
    const rows = await runFunction('get_products_above_avg_price');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/total-revenue', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT get_total_revenue() AS revenue');
    res.json({ revenue: rows[0].revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/total-users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT get_total_users() AS total');
    res.json({ total_users: rows[0].total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/avg-quantity', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT get_avg_quantity_per_order() AS average_quantity');
    res.json({ average_quantity: rows[0].average_quantity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/low-stock-products', async (req, res) => {
  try {
    const rows = await runFunction('get_low_stock_products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
