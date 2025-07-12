
// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const upload = require('./upload');
const pool = require('./db');
require('dotenv').config();
const productsRoutes = require('./routes/Products');
const authRoutes = require('./routes/users');
const adminRoutes = require('./routes/Admin');
const paymentsRoutes = require('./routes/payments');
const reportsRoutes = require('./routes/reports');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/products', productsRoutes);
app.use('/api/users', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reports', reportsRoutes);

app.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ message: 'Image uploaded successfully', filePath: `/images/${req.file.filename}` });
  } else {
    res.status(400).json({ error: 'Image upload failed' });
  }
});

const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

app.post('/api/cart', authenticateToken, async (req, res) => {
  const { product_id, quantity, price } = req.body;
  const user_id = req.user.id;

  if (!user_id || !product_id || !quantity || !price || quantity <= 0 || isNaN(quantity) || price <= 0 || isNaN(price)) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
    if (userCheck.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const productCheck = await pool.query('SELECT id, price FROM products WHERE id = $1', [product_id]);
    if (productCheck.rows.length === 0) return res.status(404).json({ message: 'Product not found' });

    if (productCheck.rows[0].price !== price) return res.status(400).json({ message: 'Invalid price for product' });

    const result = await pool.query(
      'INSERT INTO cart_items (user_id, product_id, quantity, price) ' +
      'VALUES ($1, $2, $3, $4) ' +
      'ON CONFLICT (user_id, product_id) ' +
      'DO UPDATE SET quantity = cart_items.quantity + $3, price = $4 RETURNING *',
      [user_id, product_id, quantity, price]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error adding to cart:', error.stack);
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

app.get('/api/cart', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'SELECT ci.id, ci.user_id, ci.product_id, ci.quantity, ci.price, p.name, p.image ' +
      'FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = $1',
      [user_id]
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching cart items:', error.stack);
    res.status(500).json({ message: 'Error fetching cart items' });
  }
});

app.get('/api/cart/total', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query('SELECT SUM(quantity * price) as total FROM cart_items WHERE user_id = $1', [user_id]);
    res.status(200).json({ success: true, total: result.rows[0].total || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error calculating total' });
  }
});

app.delete('/api/cart', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);
    res.status(200).json({ success: true, message: 'Cart cleared successfully', deletedCount: result.rowCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

app.delete('/api/cart/item/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting item' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { user_id, total_price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO orders (user_id, total_price, status) VALUES ($1, $2, $3) RETURNING *',
      [user_id, total_price, 'pending']
    );
    const orderId = result.rows[0].id;

    const cartItems = await pool.query('SELECT * FROM cart_items WHERE user_id = $1', [user_id]);
    for (let item of cartItems.rows) {
      await pool.query(
        'INSERT INTO order_details (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);
    res.status(201).json({ success: true, message: 'Order placed successfully', orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error placing order' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
