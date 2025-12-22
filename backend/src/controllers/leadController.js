const db = require('../config/database');

const leadController = {
  getAllLeads: async (req, res) => {
    try {
      const { status, search } = req.query;
      let query = `
        SELECT l.*, u.name as sales_name 
        FROM leads l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      // Filter by user role
      if (req.user.role === 'sales') {
        query += ` AND l.user_id = $${paramCount}`;
        params.push(req.user.id);
        paramCount++;
      }

      // Filter by status
      if (status) {
        query += ` AND l.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      // Search by name or contact
      if (search) {
        query += ` AND (l.name ILIKE $${paramCount} OR l.contact ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      query += ` ORDER BY l.created_at DESC`;

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getLeadById: async (req, res) => {
    try {
      const { id } = req.params;
      let query = `
        SELECT l.*, u.name as sales_name 
        FROM leads l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.id = $1
      `;
      const params = [id];

      if (req.user.role === 'sales') {
        query += ` AND l.user_id = $2`;
        params.push(req.user.id);
      }

      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createLead: async (req, res) => {
    try {
      const { name, contact, address, requirement, status = 'new' } = req.body;
      
      const result = await db.query(
        `INSERT INTO leads (user_id, name, contact, address, requirement, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.user.id, name, contact, address, requirement, status]
      );

      res.status(201).json({
        message: 'Lead created successfully',
        lead: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateLead: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, contact, address, requirement, status } = req.body;
      
      // Check if lead exists and belongs to user
      let checkQuery = 'SELECT * FROM leads WHERE id = $1';
      const checkParams = [id];
      
      if (req.user.role === 'sales') {
        checkQuery += ' AND user_id = $2';
        checkParams.push(req.user.id);
      }

      const checkResult = await db.query(checkQuery, checkParams);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Lead not found or access denied' });
      }

      const result = await db.query(
        `UPDATE leads 
         SET name = $1, contact = $2, address = $3, 
             requirement = $4, status = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [name, contact, address, requirement, status, id]
      );

      res.json({
        message: 'Lead updated successfully',
        lead: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteLead: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if lead exists and belongs to user
      let checkQuery = 'SELECT * FROM leads WHERE id = $1';
      const checkParams = [id];
      
      if (req.user.role === 'sales') {
        checkQuery += ' AND user_id = $2';
        checkParams.push(req.user.id);
      }

      const checkResult = await db.query(checkQuery, checkParams);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Lead not found or access denied' });
      }

      await db.query('DELETE FROM leads WHERE id = $1', [id]);

      res.json({
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getLeadStats: async (req, res) => {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_leads,
          COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
          COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_leads,
          COUNT(CASE WHEN status = 'qualified' THEN 1 END) as qualified_leads,
          COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads
        FROM leads
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      if (req.user.role === 'sales') {
        query += ` AND user_id = $${paramCount}`;
        params.push(req.user.id);
      }

      const result = await db.query(query, params);
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = leadController;