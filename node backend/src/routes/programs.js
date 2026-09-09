
const ProgramsController = require('../controllers/programscontroller');
const Program = require('../models/program');
const { requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (!imageMimeTypes.has(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and WEBP image files are allowed.'));
    }
    cb(null, true);
  }
});

module.exports = (app) => {
  const programsController = new ProgramsController(Program);

  app.get('/api/programs', (req, res) => programsController.getAllPrograms(req, res));
  app.get('/api/programs/:id', (req, res) => programsController.getProgramById(req, res));

  app.post('/api/programs', requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Image file required.' });
      const title = String(req.body.title || '').trim();
      const description = String(req.body.description || req.body.title || '').trim();
      const status = String(req.body.status || 'active').trim();
      if (!title) return res.status(400).json({ error: 'Program title is required.' });
      const image_url = '/uploads/' + req.file.filename;
      const created_by = req.session.user ? req.session.user.id : null;
      const program = await Program.create({ title, description, image_url, status, created_by });
      res.status(201).json(program);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add program.' });
    }
  });

  app.put('/api/programs/:id', requireAdmin, upload.single('image'), async (req, res) => {
    try {
      const program = await Program.findByPk(req.params.id);
      if (!program) return res.status(404).json({ error: 'Program not found' });
      let image_url = program.image_url;
      if (req.file) {
        image_url = '/uploads/' + req.file.filename;
      }
      const title = String(req.body.title || program.title || '').trim();
      const description = String(req.body.description || req.body.title || program.description || '').trim();
      const status = String(req.body.status || program.status || 'active').trim();
      await program.update({ title, description, status, image_url, last_updated: new Date() });
      res.json(program);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update program.' });
    }
  });

  app.delete('/api/programs/:id', requireAdmin, (req, res) => programsController.deleteProgram(req, res));
};
