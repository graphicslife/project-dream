const db = require('../config/db');
const UsersController = require('../controllers/userscontroller');
const User = require('../models/user')(db, require('sequelize').DataTypes);
const usersController = new UsersController(User);
const Donation = require('../models/donation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireSelfOrAdmin, requireAdmin } = require('../middleware/auth');

module.exports = (app) => {
    // Admin logs API
    const AdminLog = require('../models/admin_log');
    app.get('/api/admin/logs', requireAdmin, async (req, res) => {
      try {
        const logs = await AdminLog.findAll({
          order: [['created_at', 'DESC']],
          limit: 20
        });
        res.json(logs);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admin logs.' });
      }
    });
  // Set up multer storage for profile images
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../../frontend/assets/profile_images');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, 'user_' + req.params.id + '_' + Date.now() + ext);
    }
  });
  const upload = multer({ storage });
  // Admin: get all users with details
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await User.findAll({ attributes: ['id', 'username', 'email', 'status', 'role'] });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch users.' });
    }
  });
  // Admin approves a user (set status to 'approved' and optionally update role)
  app.put('/api/admin/users/:id/approve', requireAdmin, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.status = 'approved';
      if (req.body.role) user.role = req.body.role;
      await user.save();
      res.json({ message: 'User approved', user });
    } catch (err) {
      res.status(500).json({ error: 'Failed to approve user.' });
    }
  });

  // Admin deletes a user (for Reject button)
  app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      await user.destroy();
      res.json({ message: 'User deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete user.' });
    }
  });

  // Update user language only
  app.put('/api/users/:id/language', requireSelfOrAdmin, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      let settings = user.settings || {};
      if (typeof settings === 'string') settings = JSON.parse(settings);
      settings.language = req.body.language;
      user.settings = settings;
      await user.save();
      res.json({ message: 'Language updated', settings });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update language.' });
    }
  });

  // Get donation statistics for a user
  app.get('/api/users/:id/donation-stats', requireSelfOrAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const total = await Donation.sum('amount', { where: { user_id: userId } });
      const count = await Donation.count({ where: { user_id: userId } });
      res.json({ total: total || 0, count });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch donation stats.' });
    }
  });

  // Download user data (profile + donations)
  app.get('/api/users/:id/download', requireSelfOrAdmin, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      const donations = await Donation.findAll({ where: { user_id: req.params.id } });
      const data = { user, donations };
      res.setHeader('Content-Disposition', 'attachment; filename="user_data.json"');
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to download user data.' });
    }
  });



  app.get('/api/users', (req, res) => usersController.getAllUsers(req, res));
  app.get('/api/users/:id', requireSelfOrAdmin, (req, res) => usersController.getUserById(req, res));
  app.post('/api/users', (req, res) => usersController.createUser(req, res));
  app.put('/api/users/:id', (req, res) => usersController.updateUser(req, res));
  app.delete('/api/users/:id', requireAdmin, (req, res) => usersController.deleteUser(req, res));
  app.put('/api/users/:id/username', (req, res) => usersController.updateUsername(req, res));
    // Profile image upload endpoint (PUT with file)
    app.put('/api/users/:id/profile-picture', requireSelfOrAdmin, upload.single('profile_picture'), async (req, res) => {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }
      // Save file URL (relative to frontend)
      const fileUrl = '/profile_images/' + req.file.filename;
      user.profile_picture = fileUrl;
      await user.save();
      res.json({ message: 'Profile picture updated.', profile_picture: fileUrl });
    });
  app.put('/api/users/:id/password', requireSelfOrAdmin, (req, res) => usersController.changePassword(req, res));
  app.put('/api/users/:id/settings', requireSelfOrAdmin, (req, res) => usersController.updateSettings(req, res));
  app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required.' });
    }
    
    res.json({ message: 'If your email is registered, you will receive password reset instructions.' });
  });
};
