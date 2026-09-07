class TeamMembersController {
  constructor(TeamMember) {
    this.TeamMember = TeamMember;
  }

  async getAllTeamMembers(req, res) {
    try {
      const members = await this.TeamMember.findAll();
      res.json(members);
    } catch (err) {
      console.error('Fetch team members error:', err);
      res.status(500).json({ error: 'Failed to fetch team members.' });
    }
  }

  async getTeamMemberById(req, res) {
    try {
      const member = await this.TeamMember.findByPk(req.params.id);
      if (!member) return res.status(404).json({ error: 'Team member not found.' });
      res.json(member);
    } catch (err) {
      console.error('Fetch team member error:', err);
      res.status(500).json({ error: 'Failed to fetch team member.' });
    }
  }

  async createTeamMember(req, res) {
    try {
      const { name, role, image_url } = req.body;
      const member = await this.TeamMember.create({ name, role, image_url });
      res.status(201).json(member);
    } catch (err) {
      console.error('Create team member error:', err);
      res.status(400).json({ error: 'Failed to create team member.' });
    }
  }
}

module.exports = TeamMembersController;
