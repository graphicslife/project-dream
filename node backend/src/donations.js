const DonationsController = require('../controllers/donationscontroller');
const Donation = require('../models/donation');

module.exports = (app) => {
  const donationsController = new DonationsController(Donation);

  // Middleware to check admin role
  function isAdmin(req, res, next) {
    const role = req.session && req.session.user && req.session.user.role;
    if (role === 'admin' || role === 'super_admin') return next();
    return res.status(403).json({ error: 'Admin access required.' });
  }

  // Protect donation creation, update, and deletion for admins only
  app.post('/api/donations', isAdmin, (req, res) => donationsController.createDonation(req, res));
  app.put('/api/donations/:id', isAdmin, (req, res) => donationsController.updateDonation(req, res));
  app.delete('/api/donations/:id', isAdmin, (req, res) => donationsController.deleteDonation(req, res));
};