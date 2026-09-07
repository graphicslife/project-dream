
const Gallery = require('../models/gallery');
const multer = require('multer');
const path = require('path');
const { requireAdmin } = require('../middleware/auth');

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
const upload = multer({ storage });

module.exports = (app) => {
  // Get all gallery images
  app.get('/api/gallery', async (req, res) => {
    try {
      const images = await Gallery.findAll();
      res.json(images);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch gallery.' });
    }
  });

  // Add new image (admin only, with file upload)
  app.post('/api/gallery', requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Image file required.' });
      const image_url = '/uploads/' + req.file.filename;
      const { caption } = req.body;
      const uploaded_by = req.session.user ? req.session.user.id : null;
      const image = await Gallery.create({ image_url, caption, uploaded_by });
      res.status(201).json(image);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add image.' });
    }
  });

  // Update image/caption (admin only, supports new file upload)
  app.put('/api/gallery/:id', requireAdmin, upload.single('image'), async (req, res) => {
    try {
      const image = await Gallery.findByPk(req.params.id);
      if (!image) return res.status(404).json({ error: 'Image not found' });
      let image_url = image.image_url;
      if (req.file) {
        image_url = '/uploads/' + req.file.filename;
      }
      const { caption } = req.body;
      image.image_url = image_url;
      image.caption = caption || image.caption;
      await image.save();
      res.json(image);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update image.' });
    }
  });

  // Delete image (admin only)
  app.delete('/api/gallery/:id', requireAdmin, async (req, res) => {
    try {
      const image = await Gallery.findByPk(req.params.id);
      if (!image) return res.status(404).json({ error: 'Image not found' });
      await image.destroy();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete image.' });
    }
  });
};
