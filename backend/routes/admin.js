const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all event registrations with user details
router.get('/event-registrations', auth, adminAuth, async (req, res) => {
  try {
    const sql = `
      SELECT 
        e.id as event_id,
        e.title as event_title,
        e.date as event_date,
        u.id as user_id,
        u.username,
        u.email,
        u.full_name,
        er.registration_date,
        er.status
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      JOIN users u ON er.user_id = u.id
      ORDER BY e.date DESC, er.registration_date DESC
    `;

    const [results] = await db.promise().query(sql);

    // Group registrations by event
    const eventRegistrations = results.reduce((acc, reg) => {
      const event = {
        id: reg.event_id,
        title: reg.event_title,
        date: reg.event_date,
      };

      const user = {
        id: reg.user_id,
        username: reg.username,
        email: reg.email,
        full_name: reg.full_name,
        registration_date: reg.registration_date,
        status: reg.status
      };

      if (!acc[reg.event_id]) {
        acc[reg.event_id] = {
          event,
          registrations: []
        };
      }

      acc[reg.event_id].registrations.push(user);
      return acc;
    }, {});

    res.json(Object.values(eventRegistrations));
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Error fetching event registrations' });
  }
});

// Get user statistics
router.get('/stats', auth, adminAuth, async (req, res) => {
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
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const sql = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.isAdmin,
        u.created_at,
        COUNT(er.id) as event_count
      FROM users u
      LEFT JOIN event_registrations er ON u.id = er.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;

    const [users] = await db.promise().query(sql);

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
      created_at: user.created_at,
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
router.patch('/users/:userId', auth, adminAuth, async (req, res) => {
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