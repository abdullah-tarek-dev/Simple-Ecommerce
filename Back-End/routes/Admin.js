const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// تسجيل الأدمن الجديد
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ 
      error: 'Name, email and password are required' 
    });
  }

  try {
    // التحقق من عدم تكرار الإيميل
    const adminExists = await pool.query(
      'SELECT * FROM admins WHERE email = $1', 
      [email]
    );

    if (adminExists.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email already exists' 
      });
    }

    // تجزئة الباسوورد
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // إدراج الأدمن الجديد
    const newAdmin = await pool.query(
      'INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    // توليد توكن الدخول
    const token = jwt.sign(
      { id: newAdmin.rows[0].id, email: newAdmin.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      message: 'Admin created successfully',
      token,
      admin: {
        id: newAdmin.rows[0].id,
        name: newAdmin.rows[0].name,
        email: newAdmin.rows[0].email
      }
    });

  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// تسجيل دخول الأدمن
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }

  try {
    // البحث عن الأدمن
    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE email = $1', 
      [email]
    );
    
    const admin = adminResult.rows[0];

    if (!admin) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // التحقق من كلمة المرور
    const validPassword = await bcrypt.compare(password, admin.password);
    
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // توليد التوكن
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;