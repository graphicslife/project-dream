const bcrypt = require('bcrypt');
const db = require('./config/db');
const { Op } = require('sequelize');
const User = require('./models/user')(db, require('sequelize').DataTypes);

module.exports = (app) => {
	app.get('/api/session', (req, res) => {
		if (!req.session || !req.session.user) {
			return res.status(401).json({ authenticated: false, error: 'Authentication required.' });
		}
		return res.json({ authenticated: true, user: req.session.user });
	});

	app.post('/api/login', async (req, res) => {
		try {
			const { email, username, password } = req.body;
			const identifier = (email || username || '').trim();
			if (!password || !identifier) return res.status(400).json({ error: 'Email or username and password are required.' });
			const user = await User.findOne({
				where: {
					[Op.or]: [
						{ email: identifier },
						{ username: identifier }
					]
				}
			});
			if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
			if (user.status && user.status !== 'approved' && !['admin', 'super_admin'].includes(user.role)) return res.status(403).json({ error: 'Your account is awaiting approval.' });
			const valid = user.password_hash.startsWith('$2') ? await bcrypt.compare(password, user.password_hash) : user.password_hash === password;
			if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });
			req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
			const safeUser = user.toJSON();
			delete safeUser.password_hash;
			res.json({ message: 'Login successful!', user: safeUser });
		} catch (error) {
			console.error('Login error:', error);
			res.status(500).json({ error: 'Server error during login.' });
		}
	});
};