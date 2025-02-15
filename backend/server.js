require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const eventRoutes = require('./routes/events');
const authRoutes = require('./routes/auth');
const db = require('./config/db');
const app = require('./app');
const adminRoutes = require('./routes/admin');

const PORT = process.env.PORT || 5000;

// Add this after db.connect()
db.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('Database test query failed:', err);
  } else {
    console.log('Database test query successful');
  }
});

const JWT_SECRET = 'aaaavj';
const ADMIN_CODE = 'secret123'; // You should store this in environment variables

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, email, password, adminCode } = req.body;
  
  console.log('Registration attempt:', { username, email });
  
  // Add input validation
  if (!username || !email || !password) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Check if this is an admin registration
  const isAdmin = adminCode === ADMIN_CODE;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // First check if user already exists
    const checkUser = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUser, [email], (err, results) => {
      if (err) {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ error: 'Database error while checking user' });
      }
      
      if (results.length > 0) {
        console.log('Email already exists:', email);
        return res.status(400).json({ error: 'Email already registered' });
      }

      // If user doesn't exist, proceed with registration
      const sql = 'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)';
      db.query(sql, [username, email, hashedPassword, isAdmin], (err, result) => {
        if (err) {
          console.error('Registration error:', err);
          return res.status(400).json({ error: 'Registration failed' });
        }
        console.log('User registered successfully:', { username, email, isAdmin });
        res.json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update the token payload to match what auth middleware expects
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin 
      },
      process.env.JWT_SECRET || 'aaaavj',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  });
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 