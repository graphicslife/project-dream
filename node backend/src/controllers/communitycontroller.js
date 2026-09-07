class CommunityController {
  constructor(VolunteerInterest, TeamMessage) {
    this.VolunteerInterest = VolunteerInterest;
    this.TeamMessage = TeamMessage;
  }

  sessionUser(req) {
    return req.session && req.session.user ? req.session.user : null;
  }

  validateContact(name, email) {
    return name && email && email.includes('@');
  }

  async createVolunteerInterest(req, res) {
    try {
      const { name, email, phone, location, interests, availability, experience, motivation } = req.body;
      const normalizedInterests = Array.isArray(interests) ? interests.filter(Boolean).slice(0, 10) : [];
      if (!this.validateContact(String(name || '').trim(), String(email || '').trim()) || !normalizedInterests.length || !String(motivation || '').trim()) {
        return res.status(400).json({ error: 'Name, valid email, at least one interest, and motivation are required.' });
      }
      const user = this.sessionUser(req);
      const record = await this.VolunteerInterest.create({
        user_id: user ? user.id : null,
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
        location: location ? String(location).trim() : null,
        interests: normalizedInterests,
        availability: availability ? String(availability).trim() : null,
        experience: experience ? String(experience).trim() : null,
        motivation: String(motivation).trim(),
        status: 'new'
      });
      res.status(201).json({ success: true, message: 'Your volunteer interest has been received.', submission: record });
    } catch (err) {
      console.error('Create volunteer interest error:', err);
      res.status(400).json({ error: 'Failed to submit volunteer interest.' });
    }
  }

  async createTeamMessage(req, res) {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!this.validateContact(String(name || '').trim(), String(email || '').trim()) || !String(subject || '').trim() || !String(message || '').trim()) {
        return res.status(400).json({ error: 'Name, valid email, subject, and message are required.' });
      }
      const user = this.sessionUser(req);
      const record = await this.TeamMessage.create({
        user_id: user ? user.id : null,
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
        subject: String(subject).trim(),
        message: String(message).trim(),
        status: 'new'
      });
      res.status(201).json({ success: true, message: 'Your message has been sent to the team.', submission: record });
    } catch (err) {
      console.error('Create team message error:', err);
      res.status(400).json({ error: 'Failed to send your message.' });
    }
  }

  async list(model, req, res) {
    try {
      const records = await model.findAll({ order: [['created_at', 'DESC']] });
      res.json(records);
    } catch (err) {
      console.error('List community submissions error:', err);
      res.status(500).json({ error: 'Failed to load submissions.' });
    }
  }

  async update(model, req, res) {
    try {
      const record = await model.findByPk(req.params.id);
      if (!record) return res.status(404).json({ error: 'Submission not found.' });
      const updates = {};
      if (req.body.status !== undefined) updates.status = String(req.body.status).trim();
      if (req.body.admin_notes !== undefined) updates.admin_notes = String(req.body.admin_notes).trim();
      updates.updated_at = new Date();
      await record.update(updates);
      res.json(record);
    } catch (err) {
      console.error('Update community submission error:', err);
      res.status(400).json({ error: 'Failed to update submission.' });
    }
  }
}

module.exports = CommunityController;
