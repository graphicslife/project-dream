const crypto = require('crypto');
const db = require('../config/db');

// Helper: hash user agent for fingerprinting
function hashUserAgent(ua) {
  return crypto.createHash('sha256').update(ua || '').digest('hex');
}

// Middleware: Session, fingerprint, and analytics
async function sessionAnalytics(req, res, next) {
  const fallbackAnalytics = {
    session_id: req.session && req.session.session_id ? req.session.session_id : 0,
    session_token: req.session && req.session.session_token ? req.session.session_token : null,
    user_id: req.session && req.session.user && req.session.user.id ? req.session.user.id : null,
    is_guest: true,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || null,
    user_agent: req.headers['user-agent'] || '',
    user_agent_hash: hashUserAgent(req.headers['user-agent'] || '')
  };

  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const userAgentHash = hashUserAgent(userAgent);
    const now = new Date();
    let sessionToken = req.session.session_token;
    let userId = req.session.user && req.session.user.id ? req.session.user.id : null;
    let isGuest = !userId;

    // 1. Visitor fingerprinting (upsert)
    await db.query(`INSERT INTO visitor_fingerprints (ip_address, user_agent_hash, first_seen, last_seen, total_sessions)
      VALUES (?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE last_seen = VALUES(last_seen), total_sessions = total_sessions + 1`,
      { replacements: [ip, userAgentHash, now, now] });

    // 2. Session tracking
    if (!sessionToken) {
      sessionToken = crypto.randomBytes(32).toString('hex');
      req.session.session_token = sessionToken;
      // Create new session
      const [result] = await db.query(
        `INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, device_type, browser, os, is_guest, started_at, last_activity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        { replacements: [userId, sessionToken, ip, userAgent, null, null, null, isGuest, now, now] }
      );
      req.session.session_id = result.insertId;
    } else {
      // Update last_activity
      await db.query(
        `UPDATE user_sessions SET last_activity = ?, user_id = IFNULL(?, user_id), is_guest = ? WHERE session_token = ?`,
        { replacements: [now, userId, isGuest, sessionToken] }
      );
      // Get session_id if not set
      if (!req.session.session_id) {
        const [rows] = await db.query('SELECT id FROM user_sessions WHERE session_token = ?', { replacements: [sessionToken] });
        if (rows[0]) req.session.session_id = rows[0].id;
      }
    }
    // Attach session info to req for downstream use
    req.analytics = {
      session_id: req.session.session_id || 0,
      session_token: sessionToken,
      user_id: userId,
      is_guest: isGuest,
      ip,
      user_agent: userAgent,
      user_agent_hash: userAgentHash
    };
    next();
  } catch (err) {
    // Analytics must never prevent authentication or application routes from running.
    if (!['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(err.code)) {
      console.error('Session analytics middleware error:', err.message);
    }
    req.analytics = fallbackAnalytics;
    next();
  }
}

module.exports = sessionAnalytics;
