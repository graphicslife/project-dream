const db = require('./config/db');
const User = require('./models/user')(db, require('sequelize').DataTypes);

const { requireSelfOrAdmin } = require('./middleware/auth');

module.exports = (app) => {
	app.get('/api/profile/:id', requireSelfOrAdmin, async (req, res) => {
		try {
			const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
			if (!user) return res.status(404).json({ error: 'User not found.' });
			res.json(user);
		} catch (error) {
			console.error('Profile error:', error);
			res.status(500).json({ error: 'Failed to load profile.' });
		}
	});
};