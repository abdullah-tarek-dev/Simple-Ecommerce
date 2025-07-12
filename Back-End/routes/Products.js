const express = require('express');
const router = express.Router();
const db = require('../db');
// const authenticateAdmin = require('../middleware/authMiddleware');

//  راوت لجلب منتج معين حسب ID
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT * FROM get_product_by_id($1)', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

//  راوت لجلب كل المنتجات
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM get_all_products()');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

//  راوت لإضافة منتج جديد (بعد تعديل الدالة لاستقبال admin_id)
const authenticateAdmin = require('../middleware/authMiddleware');

//  راوت لإضافة منتج جديد باستخدام التوكن
router.post('/', authenticateAdmin, async (req, res, next) => {
  const { name, price, image, description, stock } = req.body;
  const admin_id = req.admin.id; // ← من التوكن

  try {
    const result = await db.query(
      'SELECT * FROM add_product($1, $2, $3, $4, $5, $6)',
      [name, price, image, description, stock, admin_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});



//  راوت لتحديث منتج (بدون category)
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { name, price, image, description } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM update_product($1, $2, $3, $4, $5)',
      [id, name, price, image, description]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

//  راوت لحذف منتج
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // استدعاء الدالة التي تحذف المنتج وتُرجع الـ id
    const result = await db.query('SELECT * FROM delete_product($1)', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('Error during deletion:', err);
    next(err);
  }
});



module.exports = router;



