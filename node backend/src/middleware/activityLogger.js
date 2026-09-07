// User Activity Logger Helper
const db = require('../config/db');

/**
 * Log a user activity (for automation, audit, etc)
 * @param {Object} opts { user_id, session_id, activity_type, activity_target, metadata }
 */
async function logActivity({ user_id, session_id, activity_type, activity_target = null, metadata = null }) {
  try {
    await db.query(
      `INSERT INTO user_activities (user_id, session_id, activity_type, activity_target, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      { replacements: [user_id, session_id, activity_type, activity_target, metadata ? JSON.stringify(metadata) : null] }
    );
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

module.exports = logActivity;
