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
  
  if (!shippingAddress) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }

  const userId = req.user.id;
  let connection;

  try {
    connection = await db.promise();
    await connection.beginTransaction();

    // First, get the user's current points
    const [userRows] = await connection.query(
      'SELECT points FROM users WHERE id = ?',
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      throw new Error('User not found');
    }

    const userPoints = userRows[0].points;
    console.log('Current user points:', userPoints);

    // Then get the item details
    const [itemRows] = await connection.query(
      'SELECT * FROM redemption_items WHERE id = ? AND status = "available" AND stock > 0',
      [itemId]
    );

    if (!itemRows || itemRows.length === 0) {
      throw new Error('Item not available or out of stock');
    }

    const item = itemRows[0];
    console.log('Item points required:', item.points_required);

    // Check if user has enough points
    if (userPoints < item.points_required) {
      throw new Error(`Insufficient points. You need ${item.points_required} points but have ${userPoints}`);
    }

    // Create redemption record
    await connection.query(
      'INSERT INTO redemption_history (user_id, item_id, points_spent, shipping_address) VALUES (?, ?, ?, ?)',
      [userId, itemId, item.points_required, shippingAddress]
    );

    // Update user points
    const newPoints = userPoints - item.points_required;
    await connection.query(
      'UPDATE users SET points = ? WHERE id = ?',
      [newPoints, userId]
    );

    // Update item stock
    await connection.query(`
      UPDATE redemption_items 
      SET stock = stock - 1,
          status = CASE WHEN stock - 1 <= 0 THEN 'out_of_stock' ELSE status END
      WHERE id = ?
    `, [itemId]);

    await connection.commit();
    
    // Send back the updated points in the response
    res.json({ 
      message: 'Item redeemed successfully',
      remainingPoints: newPoints,
      itemName: item.name
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Redemption error:', error);
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