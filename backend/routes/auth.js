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
    const checkUser = 'SELECT * FROM users WHERE email = ? OR username = ?';
    db.query(checkUser, [email, username], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error checking user existence' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Set isAdmin based on admin code
      const isAdmin = adminCode === '1234' ? 1 : 0;

      // Create new user with isAdmin field
      const sql = 'INSERT INTO users (username, email, password, isAdmin) VALUES (?, ?, ?, ?)';
      db.query(sql, [username, email, hashedPassword, isAdmin], (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ message: 'Error creating user' });
        }

        // Create token
        const token = jwt.sign(
          { id: result.insertId, username, isAdmin: Boolean(isAdmin) },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          token,
          user: {
            id: result.insertId,
            username,
            email,
            isAdmin: Boolean(isAdmin)
          }
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with isAdmin field
    const sql = 'SELECT id, username, email, password, isAdmin FROM users WHERE email = ?';
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

      // Create token with isAdmin claim
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          isAdmin: Boolean(user.isAdmin)
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Log the user details for debugging
      console.log('Logged in user:', {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: Boolean(user.isAdmin)
      });

      // Send response with user data including isAdmin
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: Boolean(user.isAdmin)
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