const db = require('../config/db');

module.exports = (app) => {
  // POST /api/engagement - log page view
  app.post('/api/engagement', async (req, res) => {
    try {
      const { page_url, page_title, referrer } = req.body;
      const session_id = req.analytics && req.analytics.session_id !== undefined ? req.analytics.session_id : 0;
      const user_id = req.analytics && req.analytics.user_id ? req.analytics.user_id : null;
      if (!page_url) return res.status(400).json({ error: 'Missing page_url' });
      const [result] = await db.query(
        `INSERT INTO page_engagements (session_id, user_id, page_url, page_title, referrer, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        { replacements: [session_id, user_id, page_url, page_title, referrer] }
      );
      res.json({ engagement_id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PATCH /api/engagement/:id - update time spent, scroll, interaction
  app.patch('/api/engagement/:id', async (req, res) => {
    try {
      const { time_spent_seconds, scrolled_percent, interacted } = req.body;
      const id = req.params.id;
      await db.query(
        `UPDATE page_engagements SET time_spent_seconds = ?, scrolled_percent = ?, interacted = ? WHERE id = ?`,
        { replacements: [time_spent_seconds || 0, scrolled_percent || 0, interacted ? 1 : 0, id] }
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
