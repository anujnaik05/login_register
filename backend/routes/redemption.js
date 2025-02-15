const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all redemption items
router.get('/items', auth, async (req, res) => {
  try {
    console.log('Fetching redemption items...');
    const sql = `
      SELECT *
      FROM redemption_items
      WHERE status = 'available'
      ORDER BY category ASC, points_required ASC
    `;

    const [results] = await db.promise().query(sql);
    console.log(`Found ${results.length} items`);
    
    if (!results || results.length === 0) {
      console.log('No rewards found in database');
      return res.status(404).json({ message: 'No rewards available' });
    }

    // Format and clean the data
    const items = results.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      points_required: parseInt(item.points_required),
      category: item.category.toLowerCase().trim(),
      image_url: item.image_url || `https://via.placeholder.com/300x200?text=${item.category}`,
      stock: parseInt(item.stock),
      status: item.status
    }));

    console.log(`Sending ${items.length} items to client`);
    res.json(items);
  } catch (error) {
    console.error('Error fetching redemption items:', error);
    res.status(500).json({ 
      message: 'Failed to fetch redemption items',
      error: error.message 
    });
  }
});

// Redeem an item
router.post('/redeem', auth, async (req, res) => {
  const { itemId, shippingAddress } = req.body;
  const userId = req.user.id;
  const connection = await db.promise();

  try {
    await connection.beginTransaction();

    // Get item details and check availability with stock
    const [items] = await connection.query(
      'SELECT * FROM redemption_items WHERE id = ? AND status = "available" AND stock > 0',
      [itemId]
    );
    
    const item = items[0];
    if (!item) {
      throw new Error('Item not available or out of stock');
    }

    // Check user points
    const [points] = await connection.query(
      'SELECT COALESCE(SUM(points), 0) as total FROM user_points WHERE user_id = ?',
      [userId]
    );
    
    const userPoints = points[0];
    if (userPoints.total < item.points_required) {
      throw new Error(`Insufficient points. You need ${item.points_required} points but have ${userPoints.total}`);
    }

    // Create redemption record
    await connection.query(
      'INSERT INTO redemption_history (user_id, item_id, points_spent, shipping_address) VALUES (?, ?, ?, ?)',
      [userId, itemId, item.points_required, shippingAddress]
    );

    // Deduct points
    await connection.query(
      'INSERT INTO user_points (user_id, points, action_type, description) VALUES (?, ?, ?, ?)',
      [userId, -item.points_required, 'redeemed', `Redeemed ${item.name}`]
    );

    // Update item stock and status if needed
    await connection.query(`
      UPDATE redemption_items 
      SET stock = stock - 1,
          status = CASE WHEN stock - 1 <= 0 THEN 'out_of_stock' ELSE status END
      WHERE id = ?
    `, [itemId]);

    await connection.commit();
    
    res.json({ 
      message: 'Item redeemed successfully',
      remainingPoints: userPoints.total - item.points_required
    });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ message: error.message });
  }
});

// Get user's redemption history
router.get('/history', auth, async (req, res) => {
  try {
    const sql = `
      SELECT rh.*, ri.name, ri.points_required, ri.image_url
      FROM redemption_history rh
      JOIN redemption_items ri ON rh.item_id = ri.id
      WHERE rh.user_id = ?
      ORDER BY rh.redemption_date DESC
    `;
    
    const [results] = await db.promise().query(sql, [req.user.id]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching redemption history:', err);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

// Debug routes
router.get('/debug/items-count', auth, async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT COUNT(*) as count FROM redemption_items');
    res.json({ 
      count: results[0].count,
      dbConnected: !!db
    });
  } catch (err) {
    console.error('Error counting items:', err);
    res.status(500).json({ message: 'Error counting items', error: err.message });
  }
});

router.get('/debug/items', auth, async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM redemption_items');
    console.log('Debug - Found items:', results.length);
    console.log('Sample item:', results[0]);
    
    res.json({
      count: results.length,
      sample: results[0],
      connection: db.state
    });
  } catch (error) {
    console.error('Debug - Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 