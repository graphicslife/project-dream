const express = require('express');
const db = require('../config/db');

module.exports = (app) => {
  // Middleware to check admin role
  function isAdmin(req, res, next) {
    const role = req.session && req.session.user && req.session.user.role;
    if (role === 'admin' || role === 'super_admin') return next();
    return res.status(403).json({ error: 'Admin access required.' });
  }

  app.get('/api/team_members', async (req, res) => {
    try {
      const [results] = await db.query('SELECT * FROM team_members');
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Protect team member creation, update, and deletion for admins only
  app.post('/api/team_members', isAdmin, async (req, res) => {
    const { name, role, image_url } = req.body;
    try {
      const [result] = await db.query('INSERT INTO team_members (name, role, image_url) VALUES (?, ?, ?)', { replacements: [name, role, image_url] });
      res.json({ id: result.insertId, name, role, image_url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/team_members/:id', isAdmin, async (req, res) => {
    const { name, role, image_url } = req.body;
    try {
      await db.query('UPDATE team_members SET name=?, role=?, image_url=? WHERE id=?', { replacements: [name, role, image_url, req.params.id] });
      res.json({ id: req.params.id, name, role, image_url });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/team_members/:id', isAdmin, async (req, res) => {
    try {
      await db.query('DELETE FROM team_members WHERE id=?', { replacements: [req.params.id] });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
