const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

class UsersController {
  constructor(User) {
    this.User = User;
  }
  async register(req, res) {
    try {
      let { email, password, username, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      const normalizedRole = role === 'admin' || role === 'super_admin' ? role : 'member';
      // Check if user exists
      const existing = await this.User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: 'Email already registered.' });
      }
      const password_hash = await bcrypt.hash(password, 10);
      const user = await this.User.create({
        email,
        password_hash,
        username,
        role: normalizedRole,
        status: normalizedRole === 'member' ? 'pending' : 'approved'
      });
      const safeUser = user.toJSON();
      delete safeUser.password_hash;
      res.status(201).json({ message: 'Registration successful!', user: safeUser });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
  }

  async login(req, res) {
    try {
      const { email, username, password, role } = req.body;
      const identifier = (email || username || '').trim();
      if (!password || !identifier) {
        return res.status(400).json({ error: 'Email/Username and password are required.' });
      }
      // Find user by email or username
      const user = await this.User.findOne({
        where: {
          [Op.or]: [
            { email: identifier },
            { username: identifier }
          ]
        }
      });
      if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
      if (user.status && user.status !== 'approved' && !['admin', 'super_admin'].includes(user.role)) {
        return res.status(403).json({ error: 'Your account is awaiting approval.' });
      }
      const passwordMatches = user.password_hash.startsWith('$2')
        ? await bcrypt.compare(password, user.password_hash)
        : user.password_hash === password;
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
      // Optional: check role
      if (role && user.role !== role) {
        return res.status(403).json({ error: 'Role mismatch.' });
      }
      // Set session user for session-based authentication
      if (req.session) {
        req.session.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        };
      }
      const safeUser = user.toJSON();
      delete safeUser.password_hash;
      res.json({ message: 'Login successful!', user: safeUser });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
  }
  async getAllUsers(req, res) {
    const users = await this.User.findAll();
    res.json(users);
  }
  async getUserById(req, res) {
    const user = await this.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const safeUser = user.toJSON();
    delete safeUser.password_hash;
    res.json(safeUser);
  }
  async createUser(req, res) {
    const user = await this.User.create(req.body);
    res.status(201).json(user);
      try {
        const user = await this.User.create(req.body);
        res.status(201).json(user);
      } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ error: 'Server error during user creation.' });
      }
  }
  async updateUser(req, res) {
    try {
      const user = await this.User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const allowedFields = ['username', 'email', 'phone', 'address', 'profile_picture', 'settings'];
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) user[field] = req.body[field];
      }
      await user.save();
      const safeUser = user.toJSON();
      delete safeUser.password_hash;
      res.json({ success: true, user: safeUser });
    } catch (err) {
      console.error('Update user error:', err);
      res.status(500).json({ error: 'Update failed' });
    }
  }
  async deleteUser(req, res) {
    const user = await this.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.destroy();
    res.json({ message: 'User deleted' });
      try {
        const user = await this.User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        await user.destroy();
        res.json({ message: 'User deleted' });
      } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Server error during user deletion.' });
      }
  }
  async updateUsername(req, res) {
    const user = await this.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.username = req.body.username;
    await user.save();
    res.json(user);
  }
  async changePassword(req, res) {
    const user = await this.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const matches = user.password_hash.startsWith('$2')
      ? await bcrypt.compare(req.body.current_password || '', user.password_hash)
      : user.password_hash === req.body.current_password;
    if (!matches) return res.status(401).json({ error: 'Current password is incorrect.' });
    if (!req.body.new_password || req.body.new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    user.password_hash = await bcrypt.hash(req.body.new_password, 10);
    await user.save();
    res.json({ message: 'Password updated.' });
  }
  async updateSettings(req, res) {
    const user = await this.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.settings = req.body.settings;
    await user.save();
    res.json(user);
  }
}
module.exports = UsersController;
