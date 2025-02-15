const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.put('/profile', auth, async (req, res) => {
  const { username, fullName, bio, interests } = req.body;
  
  try {
    const sql = `
      UPDATE users 
      SET username = ?, fullName = ?, bio = ?, interests = ?
      WHERE id = ?
    `;
    
    db.query(sql, [username, fullName, bio, JSON.stringify(interests), req.user.id], (err, result) => {
      if (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({ message: 'Error updating profile' });
      }
      
      // Fetch updated user data
      db.query('SELECT * FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Profile updated but error fetching details' });
        }
        const user = results[0];
        delete user.password; // Don't send password back
        res.json(user);
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get user points
router.get('/points', auth, (req, res) => {
  const sql = `
    SELECT COALESCE(SUM(points), 0) as points 
    FROM user_points 
    WHERE user_id = ?
  `;
  
  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching user points:', err);
      return res.status(500).json({ message: 'Error fetching points' });
    }
    
    // Return 0 if no points found
    const points = results[0]?.points || 0;
    res.json({ points });
  });
});

// Add test points (for testing)
router.post('/add-test-points', auth, (req, res) => {
  const sql = `
    INSERT INTO user_points (user_id, points, action_type, description)
    VALUES (?, 1000, 'earned', 'Initial test points')
  `;
  
  db.query(sql, [req.user.id], (err, result) => {
    if (err) {
      console.error('Error adding test points:', err);
      return res.status(500).json({ message: 'Error adding points' });
    }
    res.json({ message: 'Test points added successfully', points: 1000 });
  });
});

module.exports = router; 