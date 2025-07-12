// routes/payments.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

const verifyUserToken = require('../middleware/authUserMiddleware'); // ✅

router.post('/', verifyUserToken, async (req, res) => {
  const { order_id, amount, method, status } = req.body;

  try {
    if (!order_id || !amount || !method) {
      return res.status(400).json({ message: 'data is not complete  order_id, amount, method are required' });
    }

    const result = await pool.query(
      'SELECT create_payment($1, $2, $3, $4) AS message',
      [order_id, amount, method, status || 'Pending']
    );

    const message = result.rows[0].message;

    if (message.includes('✅')) {
      res.status(201).json({ message });
    } else {
      res.status(400).json({ message });
    }
  } catch (error) {
    console.error('❌ Error calling create_payment:', error);
    res.status(500).json({ error: 'failed to payment' });
  }
});

module.exports = router;
