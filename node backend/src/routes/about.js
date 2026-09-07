const db = require('../config/db');
const aboutData = require('../about');

module.exports = (app) => {
  app.get('/api/about', async (req, res) => {
    try {
      const [teamMembers] = await db.query('SELECT * FROM team_members ORDER BY id ASC');
      const payload = {
        ...aboutData,
        team: teamMembers && teamMembers.length ? teamMembers : aboutData.team
      };
      res.json(payload);
    } catch (error) {
      console.error('About data error:', error);
      res.status(500).json({
        error: 'Failed to load about information.',
        fallback: aboutData
      });
    }
  });
};
