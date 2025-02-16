const express = require('express');
const router = express.Router();
const db = require('../config/db');
const cors = require('cors');

// Enable CORS
router.use(cors());

// Get all events
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT e.*, 
        COUNT(er.id) as registration_count 
      FROM events e 
      LEFT JOIN event_registrations er ON e.id = er.event_id 
      GROUP BY e.id 
      ORDER BY e.date DESC
    `;
    
    const [events] = await db.promise().query(sql);
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get user's registered events
router.get('/my-registrations', async (req, res) => {
  try {
    const sql = `
      SELECT e.*, er.registration_date, er.status as registration_status
      FROM events e
      JOIN event_registrations er ON e.id = er.event_id
      WHERE er.user_id = ?
      ORDER BY e.date DESC`;

    const [results] = await db.promise().query(sql, [req.user.id]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

// Register for an event
router.post('/register/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.body.userId; // Get userId from request body instead of token

    // Check if already registered
    const [existingReg] = await db.promise().query(
      'SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (existingReg.length > 0) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check event capacity
    const [event] = await db.promise().query(
      'SELECT capacity, (SELECT COUNT(*) FROM event_registrations WHERE event_id = ?) as current_registrations FROM events WHERE id = ?',
      [eventId, eventId]
    );

    if (event.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event[0].current_registrations >= event[0].capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Register for event
    await db.promise().query(
      'INSERT INTO event_registrations (event_id, user_id, status) VALUES (?, ?, "confirmed")',
      [eventId, userId]
    );

    // Award points for registration
    await db.promise().query(
      'UPDATE users SET points = points + 10 WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Successfully registered for event' });
  } catch (err) {
    console.error('Error registering for event:', err);
    res.status(500).json({ message: 'Error registering for event' });
  }
});

// Cancel registration
router.delete('/register/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.body.userId; // Get userId from request body instead of token

    const [result] = await db.promise().query(
      'DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Deduct points for cancellation
    await db.promise().query(
      'UPDATE users SET points = points - 10 WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling registration:', err);
    res.status(500).json({ message: 'Error cancelling registration' });
  }
});

// Create new event
router.post('/', async (req, res) => {
  try {
    const { title, description, date, location, type, capacity, status } = req.body;

    const [result] = await db.promise().query(
      'INSERT INTO events (title, description, date, location, type, capacity, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, date, location, type, capacity, status]
    );

    res.status(201).json({
      message: 'Event created successfully',
      eventId: result.insertId
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Update event
router.put('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, date, location, type, capacity, status } = req.body;

    await db.promise().query(
      'UPDATE events SET title = ?, description = ?, date = ?, location = ?, type = ?, capacity = ?, status = ? WHERE id = ?',
      [title, description, date, location, type, capacity, status, eventId]
    );

    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete event
router.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    await db.promise().query('DELETE FROM event_registrations WHERE event_id = ?', [eventId]);
    await db.promise().query('DELETE FROM events WHERE id = ?', [eventId]);

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router; 