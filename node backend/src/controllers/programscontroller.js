class ProgramsController {
  constructor(Program) {
    this.Program = Program;
  }
  async getAllPrograms(req, res) {
    try {
      const programs = await this.Program.findAll();
      res.json(programs);
    } catch (err) {
      console.error('Fetch programs error:', err);
      res.status(500).json({ error: 'Failed to fetch programs.' });
    }
  }
  async getProgramById(req, res) {
    try {
      const program = await this.Program.findByPk(req.params.id);
      if (!program) return res.status(404).json({ error: 'Program not found' });
      res.json(program);
    } catch (err) {
      console.error('Fetch program error:', err);
      res.status(500).json({ error: 'Failed to fetch program.' });
    }
  }

  async createProgram(req, res) {
    try {
      const { title, description, image_url, status, created_by } = req.body;
      const program = await this.Program.create({ title, description, image_url, status, created_by });
      res.status(201).json(program);
    } catch (err) {
      console.error('Create program error:', err);
      res.status(500).json({ error: 'Failed to create program.' });
    }
  }

  async updateProgram(req, res) {
    try {
      const { title, description, image_url, status } = req.body;
      const program = await this.Program.findByPk(req.params.id);
      if (!program) return res.status(404).json({ error: 'Program not found' });
      await program.update({ title, description, image_url, status, last_updated: new Date() });
      res.json(program);
    } catch (err) {
      console.error('Update program error:', err);
      res.status(500).json({ error: 'Failed to update program.' });
    }
  }

  async deleteProgram(req, res) {
    try {
      const program = await this.Program.findByPk(req.params.id);
      if (!program) return res.status(404).json({ error: 'Program not found' });
      await program.destroy();
      res.json({ message: 'Program deleted' });
    } catch (err) {
      console.error('Delete program error:', err);
      res.status(500).json({ error: 'Failed to delete program.' });
    }
  }
}
module.exports = ProgramsController;