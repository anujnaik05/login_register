const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin code is provided and valid
    const isAdmin = adminCode === process.env.ADMIN_SECRET_CODE;

    // Insert new user with 1000 points
    const [result] = await db.promise().query(
      'INSERT INTO users (username, email, password, isAdmin, points) VALUES (?, ?, ?, ?, 1000)',
      [username, email, hashedPassword, isAdmin]
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        username,
        email,
        isAdmin,
        points: 1000
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with points field
    const sql = 'SELECT id, username, email, password, isAdmin, points FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error finding user' });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const user = results[0];
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          isAdmin: Boolean(user.isAdmin)
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Send response with user data including points
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: Boolean(user.isAdmin),
          points: user.points
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  const sql = 'SELECT id, username, email, isAdmin FROM users WHERE id = ?';
  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Error fetching user data' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(results[0]);
  });
});

module.exports = router; 