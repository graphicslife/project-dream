

const path = require('path');
require('dotenv').config({ quiet: true, path: path.resolve(__dirname, '.env') });
const express = require('express');
const multer = require('multer');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN || 'http://localhost:5500,http://127.0.0.1:5500')
	.split(',').map(origin => origin.trim()).filter(Boolean);


const db = require('./config/db');
require('./models/volunteer_interest');
require('./models/team_message');
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});



// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
	origin: FRONTEND_ORIGINS,
  credentials: true,
}));

// Ensure uploads directory exists and serve it statically
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const profileImagesDir = path.join(__dirname, '../../frontend/assets/profile_images');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(profileImagesDir)) fs.mkdirSync(profileImagesDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));
app.use('/profile_images', express.static(profileImagesDir));

// Session middleware
app.use(session({
	secret: process.env.SESSION_SECRET || 'dream_secret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 3 * 60 * 1000, // 3 minutes
		sameSite: 'lax',
		httpOnly: true
	}
}));


// Session expiry on inactivity (rolling)

// Register analytics and engagement routes after app and middleware are set up
app.use('/api/admin/analytics', require('./routes/adminAnalytics'));
app.use((req, res, next) => {
  if (req.session) req.session._garbage = Date();
  if (req.session) req.session.touch();
  next();
});

// Session, fingerprint, and analytics middleware
const sessionAnalytics = require('./middleware/sessionAnalytics');
app.use(sessionAnalytics);

// Initialize database schema and required columns
async function initializeDatabase() {
  try {
    await db.authenticate();
    console.log('Database connected...');

    await db.sync({ alter: true });
    console.log('Models synced');

    const donationColumns = [
      ['currency', "ALTER TABLE donations ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'TZS' AFTER amount"],
      ['donation_type', "ALTER TABLE donations ADD COLUMN donation_type VARCHAR(20) NOT NULL DEFAULT 'money' AFTER amount"],
      ['program', 'ALTER TABLE donations ADD COLUMN program VARCHAR(100) NULL AFTER donation_type'],
      ['donor_name', 'ALTER TABLE donations ADD COLUMN donor_name VARCHAR(150) NULL AFTER program'],
      ['donor_email', 'ALTER TABLE donations ADD COLUMN donor_email VARCHAR(150) NULL AFTER donor_name'],
      ['donor_phone', 'ALTER TABLE donations ADD COLUMN donor_phone VARCHAR(50) NULL AFTER donor_email'],
      ['promises', 'ALTER TABLE donations ADD COLUMN promises JSON NULL AFTER donor_phone'],
      ['follow_up_status', "ALTER TABLE donations ADD COLUMN follow_up_status VARCHAR(30) NULL DEFAULT 'pending' AFTER promises"],
      ['follow_up_notes', 'ALTER TABLE donations ADD COLUMN follow_up_notes TEXT NULL AFTER follow_up_status']
    ];

    for (const [columnName, statement] of donationColumns) {
      const [rows] = await db.query('SHOW COLUMNS FROM donations LIKE ?', { replacements: [columnName] });
      if (!rows.length) await db.query(statement);
    }

    const userColumns = [
      ['phone', 'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL AFTER profile_picture'],
      ['address', 'ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT NULL AFTER phone'],
      ['settings', 'ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSON NULL AFTER status']
    ];

    for (const [columnName, statement] of userColumns) {
      const [rows] = await db.query('SHOW COLUMNS FROM users LIKE ?', { replacements: [columnName] });
      if (!rows.length) {
        await db.query(statement);
      }
    }

    const analyticsTables = [
      `CREATE TABLE IF NOT EXISTS visitor_fingerprints (
        id INT NOT NULL AUTO_INCREMENT,
        ip_address VARCHAR(255) NOT NULL,
        user_agent_hash VARCHAR(64) NOT NULL,
        first_seen DATETIME NOT NULL,
        last_seen DATETIME NOT NULL,
        total_sessions INT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY visitor_fingerprint_unique (ip_address, user_agent_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT DEFAULT NULL,
        session_token VARCHAR(64) NOT NULL,
        ip_address VARCHAR(255) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        device_type VARCHAR(50) DEFAULT NULL,
        browser VARCHAR(100) DEFAULT NULL,
        os VARCHAR(100) DEFAULT NULL,
        is_guest TINYINT(1) NOT NULL DEFAULT 1,
        started_at DATETIME NOT NULL,
        last_activity DATETIME NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY session_token_unique (session_token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS page_engagements (
        id INT NOT NULL AUTO_INCREMENT,
        session_id INT NOT NULL,
        user_id INT DEFAULT NULL,
        page_url VARCHAR(500) NOT NULL,
        page_title VARCHAR(255) DEFAULT NULL,
        referrer VARCHAR(500) DEFAULT NULL,
        time_spent_seconds INT NOT NULL DEFAULT 0,
        scrolled_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
        interacted TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      `CREATE TABLE IF NOT EXISTS user_activities (
        id INT NOT NULL AUTO_INCREMENT,
        user_id INT DEFAULT NULL,
        session_id INT DEFAULT NULL,
        activity_type VARCHAR(100) NOT NULL,
        activity_target VARCHAR(255) DEFAULT NULL,
        metadata LONGTEXT DEFAULT NULL,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    ];

    for (const statement of analyticsTables) {
      await db.query(statement);
    }
  } catch (err) {
    console.error('Database initialization error:', err.message || err);
  }
}
initializeDatabase();

// Link routes


require('./routes/programs')(app); // Programs API
require('./routes/users')(app); // Users API
require('./routes/team_members')(app); // Team Members API
require('./routes/engagement')(app); // Engagement tracking API
require('./routes/about')(app); // About page API
require('./routes/gallery')(app); // Gallery API
require('./routes/donations')(app); // Donations API
require('./routes/community')(app); // Volunteer interests and team messages
require('./register')(app);
require('./login')(app);
require('./profile')(app);

// Logout endpoint (must be after app is defined and middleware is set up)
app.post('/api/logout', (req, res) => {
	req.session.destroy(() => {
		res.clearCookie('connect.sid');
		res.json({ message: 'Logged out' });
	});
});

// Global error handler (should be after all routes)
app.use((err, req, res, next) => {
	console.error('Global error:', err);
	res.status(err.status || 500).json({
		error: err.message || 'Internal server error',
		details: err.details || undefined
	});
});

// Start server
app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
});

module.exports = app;
