const express = require('express');
const db = require('../config/db');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

// GET /api/admin/online-users
router.get('/online-users', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT us.id as session_id, us.user_id, us.ip_address, us.is_guest, us.last_activity, us.started_at,
             u.username, u.email, pe.page_url, pe.page_title
      FROM user_sessions us
      LEFT JOIN users u ON us.user_id = u.id
      LEFT JOIN page_engagements pe ON pe.session_id = us.id
      WHERE us.last_activity > (NOW() - INTERVAL 5 MINUTE)
      ORDER BY us.last_activity DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/engagement-metrics
router.get('/engagement-metrics', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT page_url, COUNT(*) as views, SUM(time_spent_seconds) as total_time, AVG(scrolled_percent) as avg_scroll
      FROM page_engagements
      GROUP BY page_url
      ORDER BY views DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/activity-stream
router.get('/activity-stream', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ua.*, u.username
      FROM user_activities ua
      LEFT JOIN users u ON ua.user_id = u.id
      ORDER BY ua.created_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
