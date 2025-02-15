const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all events
router.get('/', auth, (req, res) => {
  console.log('Fetching events for user:', req.user.id);
  
  const sql = `
    SELECT e.*, u.username as creator_name 
    FROM events e 
    LEFT JOIN users u ON e.created_by = u.id
    ORDER BY e.date DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ message: 'Error fetching events', error: err.message });
    }
    console.log('Found events:', results.length);
    res.json(results);
  });
});

// Create new event (admin only)
router.post('/', auth, adminAuth, (req, res) => {
  const { title, description, date, location, type, capacity, status } = req.body;
  const created_by = req.user.id;

  if (!title || !description || !date || !location || !capacity) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  const sql = `
    INSERT INTO events 
    (title, description, date, location, type, capacity, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description, date, location, type, capacity, status || 'upcoming', created_by],
    (err, result) => {
      if (err) {
        console.error('Database error creating event:', err);
        return res.status(400).json({ 
          message: 'Error creating event', 
          error: err.message 
        });
      }
      
      // Fetch the created event
      db.query('SELECT * FROM events WHERE id = ?', [result.insertId], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Event created but error fetching details' });
        }
        res.status(201).json(results[0]);
      });
    }
  );
});

// Update event (admin only)
router.put('/:id', auth, adminAuth, (req, res) => {
  const eventId = req.params.id;
  const { title, description, date, location, type, capacity, status } = req.body;

  const sql = `
    UPDATE events 
    SET title = ?, description = ?, date = ?, location = ?, 
        type = ?, capacity = ?, status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [title, description, date, location, type, capacity, status, eventId],
    (err, result) => {
      if (err) {
        console.error('Error updating event:', err);
        return res.status(400).json({ message: 'Error updating event' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Fetch the updated event
      db.query('SELECT * FROM events WHERE id = ?', [eventId], (err, results) => {
        if (err) {
          console.error('Error fetching updated event:', err);
          return res.status(500).json({ message: 'Event updated but error fetching details' });
        }
        res.json(results[0]);
      });
    }
  );
});

// Delete event (admin only)
router.delete('/:id', auth, adminAuth, (req, res) => {
  const sql = 'DELETE FROM events WHERE id = ?';
  
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting event:', err);
      return res.status(500).json({ message: 'Error deleting event' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  });
});

// Add this at the top of your routes file
router.get('/test', (req, res) => {
  res.json({ message: 'Events API is working' });
});

// Register for an event
router.post('/register/:eventId', auth, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user.id;

  try {
    // First check if the event exists and its status
    const checkEventSql = `
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as registered_count
      FROM events e 
      WHERE e.id = ?`;

    db.query(checkEventSql, [eventId], (err, results) => {
      if (err) {
        console.error('Error checking event:', err);
        return res.status(500).json({ message: 'Error checking event availability' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const event = results[0];

      // Check if event is upcoming
      if (event.status !== 'upcoming') {
        return res.status(400).json({ message: 'Registration is only available for upcoming events' });
      }
      
      // Check if event is full
      if (event.registered_count >= event.capacity) {
        return res.status(400).json({ message: 'Event is already full' });
      }

      // Check if user is already registered
      const checkRegistrationSql = 'SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?';
      db.query(checkRegistrationSql, [eventId, userId], (err, registrations) => {
        if (err) {
          console.error('Error checking registration:', err);
          return res.status(500).json({ message: 'Error checking registration' });
        }

        if (registrations.length > 0) {
          return res.status(400).json({ message: 'You are already registered for this event' });
        }

        // Register the user
        const registerSql = 'INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)';
        db.query(registerSql, [eventId, userId], (err, result) => {
          if (err) {
            console.error('Error registering for event:', err);
            return res.status(500).json({ message: 'Error registering for event' });
          }

          res.status(201).json({ 
            message: 'Successfully registered for event',
            registration: {
              id: result.insertId,
              event_id: eventId,
              user_id: userId
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Get user's registered events
router.get('/my-registrations', auth, (req, res) => {
  const sql = `
    SELECT e.*, er.registration_date, er.status as registration_status
    FROM events e
    JOIN event_registrations er ON e.id = er.event_id
    WHERE er.user_id = ?
    ORDER BY e.date DESC`;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching registrations:', err);
      return res.status(500).json({ message: 'Error fetching registrations' });
    }
    res.json(results);
  });
});

// Cancel registration
router.delete('/register/:eventId', auth, (req, res) => {
  const sql = 'DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?';
  
  db.query(sql, [req.params.eventId, req.user.id], (err, result) => {
    if (err) {
      console.error('Error cancelling registration:', err);
      return res.status(500).json({ message: 'Error cancelling registration' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
    res.json({ message: 'Registration cancelled successfully' });
  });
});

module.exports = router; 