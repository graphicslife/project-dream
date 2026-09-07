const CommunityController = require('../controllers/communitycontroller');
const VolunteerInterest = require('../models/volunteer_interest');
const TeamMessage = require('../models/team_message');
const { requireAdmin } = require('../middleware/auth');

module.exports = (app) => {
  const controller = new CommunityController(VolunteerInterest, TeamMessage);

  app.post('/api/volunteer-interests', (req, res) => controller.createVolunteerInterest(req, res));
  app.post('/api/team-messages', (req, res) => controller.createTeamMessage(req, res));
  app.get('/api/admin/volunteer-interests', requireAdmin, (req, res) => controller.list(VolunteerInterest, req, res));
  app.put('/api/admin/volunteer-interests/:id', requireAdmin, (req, res) => controller.update(VolunteerInterest, req, res));
  app.get('/api/admin/team-messages', requireAdmin, (req, res) => controller.list(TeamMessage, req, res));
  app.put('/api/admin/team-messages/:id', requireAdmin, (req, res) => controller.update(TeamMessage, req, res));
};
