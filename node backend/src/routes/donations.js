const DonationsController = require('../controllers/donationscontroller');
const Donation = require('../models/donation');
const { requireAuth, requireAdmin } = require('../middleware/auth');

module.exports = (app) => {
  const donationsController = new DonationsController(Donation);

  app.get('/api/donations', requireAdmin, (req, res) => donationsController.getAllDonations(req, res));
  app.get('/api/donations/:id', requireAuth, (req, res) => donationsController.getDonationById(req, res));
  app.post('/api/donations', (req, res) => donationsController.createDonation(req, res));
  app.put('/api/donations/:id', requireAdmin, (req, res) => donationsController.updateDonation(req, res));
  app.delete('/api/donations/:id', requireAdmin, (req, res) => donationsController.deleteDonation(req, res));
};
