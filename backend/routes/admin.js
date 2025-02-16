const express = require('express');
const router = express.Router();
const db = require('../config/db');
const cors = require('cors');

// Enable CORS for all routes
router.use(cors());

// Get all event registrations with user details
router.get('/event-registrations', async (req, res) => {
  try {
    const sql = `
      SELECT 
        e.id as event_id,
        e.title as event_title,
        e.description as event_description,
        e.date as event_date,
        e.location as event_location,
        e.status as event_status,
        e.type as event_type,
        e.capacity as event_capacity,
        er.id as registration_id,
        er.user_id,
        er.registration_date,
        er.status as registration_status,
        u.username,
        u.email
      FROM events e
      LEFT JOIN event_registrations er ON e.id = er.event_id
      LEFT JOIN users u ON er.user_id = u.id
      ORDER BY e.date DESC, er.registration_date DESC
    `;

    const [results] = await db.promise().query(sql);
    
    if (!results || results.length === 0) {
      return res.json([]);
    }

    // Group registrations by event
    const eventRegistrations = results.reduce((acc, row) => {
      if (!acc[row.event_id]) {
        acc[row.event_id] = {
          event: {
            id: row.event_id,
            title: row.event_title,
            description: row.event_description,
            date: row.event_date,
            location: row.event_location,
            status: row.event_status,
            type: row.event_type,
            capacity: row.event_capacity
          },
          registrations: []
        };
      }

      if (row.registration_id) {
        acc[row.event_id].registrations.push({
          id: row.registration_id,
          userId: row.user_id,
          username: row.username,
          email: row.email,
          registrationDate: row.registration_date,
          status: row.registration_status
        });
      }

      return acc;
    }, {});

    res.json(Object.values(eventRegistrations));
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Error fetching event registrations' });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const [userStats] = await db.promise().query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN isAdmin = 1 THEN 1 ELSE 0 END) as admin_count
      FROM users
    `);

    const [eventStats] = await db.promise().query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN date > NOW() THEN 1 END) as upcoming_events,
        COUNT(CASE WHEN date <= NOW() THEN 1 END) as past_events
      FROM events
    `);

    const [registrationStats] = await db.promise().query(`
      SELECT 
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_registrations,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_registrations
      FROM event_registrations
    `);

    res.json({
      users: userStats[0],
      events: eventStats[0],
      registrations: registrationStats[0]
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.isAdmin,
        u.created_at,
        u.points,
        COUNT(er.id) as event_count
      FROM users u
      LEFT JOIN event_registrations er ON u.id = er.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;

    const [users] = await db.promise().query(sql);

    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
      created_at: user.created_at,
      points: user.points || 0,
      event_count: user.event_count
    }));

    res.json({
      users: formattedUsers
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Update user status
router.patch('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'undefined') {
      await db.promise().query(
        'UPDATE users SET isAdmin = ? WHERE id = ?',
        [isAdmin ? 1 : 0, userId]
      );
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

module.exports = router; 