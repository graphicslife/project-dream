const db = require('./config/db');
const User = require('./models/user')(db, require('sequelize').DataTypes);
const bcrypt = require('bcrypt');

module.exports = (app) => {
	app.post('/api/register', async (req, res) => {
		try {
			const { username, email, password, role } = req.body;
			if (!username || !email || !password || password.length < 6) {
				return res.status(400).json({ error: 'Username, valid email, and a password of at least 6 characters are required.' });
			}
			const existing = await User.findOne({ where: { email } });
			if (existing) return res.status(409).json({ error: 'Email already registered.' });
			const normalizedRole = role === 'admin' || role === 'super_admin' ? role : 'member';
			const password_hash = await bcrypt.hash(password, 10);
			const user = await User.create({
				username,
				email,
				password_hash,
				role: normalizedRole,
				status: normalizedRole === 'member' ? 'pending' : 'approved'
			});
			res.status(201).json({ message: 'Registration successful!', user: { id: user.id, username: user.username, email: user.email, role: user.role, status: user.status } });
		} catch (err) {
			console.error('Registration error:', err);
			res.status(500).json({ error: 'Server error during registration.' });
		}
	});
};
