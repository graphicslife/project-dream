class DonationsController {
  constructor(Donation) {
    this.Donation = Donation;
  }

  async getAllDonations(req, res) {
    try {
      const donations = await this.Donation.findAll();
      res.json(donations);
    } catch (err) {
      console.error('Fetch donations error:', err);
      res.status(500).json({ error: 'Failed to fetch donations.' });
    }
  }

  async getDonationById(req, res) {
    try {
      const donation = await this.Donation.findByPk(req.params.id);
      if (!donation) return res.status(404).json({ error: 'Donation not found.' });
      res.json(donation);
    } catch (err) {
      console.error('Fetch donation error:', err);
      res.status(500).json({ error: 'Failed to fetch donation.' });
    }
  }

  async createDonation(req, res) {
    try {
      const { amount, currency, donation_type, program, donor, promises } = req.body;
      const donationType = donation_type === 'material' ? 'material' : 'money';
      const donationCurrency = currency === 'USD' ? 'USD' : 'TZS';
      const numericAmount = Number(amount);
      const donorName = donor && String(donor.name || '').trim();
      const donorEmail = donor && String(donor.email || '').trim();
      if (!donorName || !donorEmail || !donorEmail.includes('@')) {
        return res.status(400).json({ error: 'Donor name and a valid email are required.' });
      }
      if (donationType === 'money' && (!Number.isFinite(numericAmount) || numericAmount <= 0)) {
        return res.status(400).json({ error: 'A positive donation amount is required.' });
      }
      if (donationType === 'material' && (!Number.isFinite(numericAmount) || numericAmount < 0)) {
        return res.status(400).json({ error: 'Material donations must not have a negative amount.' });
      }
      const user_id = req.session && req.session.user ? req.session.user.id : null;
      const donation = await this.Donation.create({
        user_id,
        amount: numericAmount,
        currency: donationCurrency,
        donation_type: donationType,
        program: program || null,
        donor_name: donorName,
        donor_email: donorEmail,
        donor_phone: donor.phone ? String(donor.phone).trim() : null,
        promises: promises || null,
        follow_up_status: 'pending'
      });
      res.status(201).json({
        success: true,
        message: 'Donation received successfully.',
        amount: Number(donation.amount),
        donation
      });
    } catch (err) {
      console.error('Create donation error:', err);
      res.status(400).json({ error: 'Failed to create donation.' });
    }
  }

  async updateDonation(req, res) {
    const donation = await this.Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found.' });
    if (req.body.amount !== undefined && (!Number.isFinite(Number(req.body.amount)) || Number(req.body.amount) < 0)) {
      return res.status(400).json({ error: 'A positive donation amount is required.' });
    }
    const updates = {};
    if (req.body.amount !== undefined) updates.amount = req.body.amount;
    if (req.body.follow_up_status !== undefined) updates.follow_up_status = req.body.follow_up_status;
    if (req.body.follow_up_notes !== undefined) updates.follow_up_notes = req.body.follow_up_notes;
    await donation.update(updates);
    res.json(donation);
  }

  async deleteDonation(req, res) {
    const donation = await this.Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ error: 'Donation not found.' });
    await donation.destroy();
    res.json({ message: 'Donation deleted.' });
  }
}

module.exports = DonationsController;
