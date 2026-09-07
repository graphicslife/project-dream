module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Program', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    image_url: DataTypes.STRING,
    status: DataTypes.STRING,
    last_updated: DataTypes.DATE,
    created_by: DataTypes.INTEGER
  });
};

const programsData = [
  {
    title: 'Program 1',
    description: 'Description for program 1',
    image_url: 'http://example.com/image1.jpg',
    status: 'active',
    last_updated: new Date(),
    created_by: 1
  },
  {
    title: 'Program 2',
    description: 'Description for program 2',
    image_url: 'http://example.com/image2.jpg',
    status: 'inactive',
    last_updated: new Date(),
    created_by: 2
  }
];

module.exports = programsData;

// Middleware to check admin role
function isAdmin(req, res, next) {
  // Example: role from req.body, req.user, or session
  const role = req.body.role || req.user?.role;
  if (role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required.' });
}

// Protect program creation, update, and deletion for admins only
app.post('/api/programs', isAdmin, (req, res) => programsController.createProgram(req, res));
app.put('/api/programs/:id', isAdmin, (req, res) => programsController.updateProgram(req, res));
app.delete('/api/programs/:id', isAdmin, (req, res) => programsController.deleteProgram(req, res));