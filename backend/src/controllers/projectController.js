const db = require('../config/database');

const projectController = {
  getAllProjects: async (req, res) => {
    try {
      const { status } = req.query;
      let query = `
        SELECT p.*, 
               l.name as lead_name, 
               l.contact as lead_contact,
               u.name as sales_name,
               m.name as approved_by_name,
               COUNT(pi.id) as total_items,
               SUM(pi.subtotal) as total_value
        FROM projects p
        LEFT JOIN leads l ON p.lead_id = l.id
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN users m ON p.approved_by = m.id
        LEFT JOIN project_items pi ON p.id = pi.project_id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      // Filter by user role
      if (req.user.role === 'sales') {
        query += ` AND p.user_id = $${paramCount}`;
        params.push(req.user.id);
        paramCount++;
      }

      // Filter by status
      if (status) {
        query += ` AND p.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      query += `
        GROUP BY p.id, l.name, l.contact, u.name, m.name
        ORDER BY p.created_at DESC
      `;

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProjectById: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get project details
      let query = `
        SELECT p.*, 
               l.name as lead_name, 
               l.contact as lead_contact,
               l.address as lead_address,
               u.name as sales_name,
               m.name as approved_by_name
        FROM projects p
        LEFT JOIN leads l ON p.lead_id = l.id
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN users m ON p.approved_by = m.id
        WHERE p.id = $1
      `;
      const params = [id];

      if (req.user.role === 'sales') {
        query += ` AND p.user_id = $2`;
        params.push(req.user.id);
      }

      const projectResult = await db.query(query, params);
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Get project items
      const itemsResult = await db.query(
        `SELECT pi.*, pr.name as product_name, pr.price as regular_price
         FROM project_items pi
         LEFT JOIN products pr ON pi.product_id = pr.id
         WHERE pi.project_id = $1`,
        [id]
      );

      const project = projectResult.rows[0];
      project.items = itemsResult.rows;

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createProject: async (req, res) => {
    try {
      const { lead_id, items } = req.body;
      
      // Check if lead exists and belongs to user
      let leadCheckQuery = 'SELECT * FROM leads WHERE id = $1';
      const leadCheckParams = [lead_id];
      
      if (req.user.role === 'sales') {
        leadCheckQuery += ' AND user_id = $2';
        leadCheckParams.push(req.user.id);
      }

      const leadResult = await db.query(leadCheckQuery, leadCheckParams);
      
      if (leadResult.rows.length === 0) {
        return res.status(404).json({ error: 'Lead not found or access denied' });
      }

      // Check if any item price is below regular price
      const hasLowPrice = await Promise.all(
        items.map(async (item) => {
          const productResult = await db.query(
            'SELECT price FROM products WHERE id = $1',
            [item.product_id]
          );
          
          if (productResult.rows.length === 0) return false;
          
          const regularPrice = parseFloat(productResult.rows[0].price);
          const negotiatedPrice = parseFloat(item.negotiated_price);
          
          return negotiatedPrice < regularPrice;
        })
      );

      const needsApproval = hasLowPrice.some(item => item === true);
      const status = needsApproval ? 'waiting_approval' : 'approved';

      // Start transaction
      await db.query('BEGIN');

      try {
        // Create project
        const projectResult = await db.query(
          `INSERT INTO projects (lead_id, user_id, status)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [lead_id, req.user.id, status]
        );

        const projectId = projectResult.rows[0].id;

        // Create project items
        for (const item of items) {
          await db.query(
            `INSERT INTO project_items (project_id, product_id, negotiated_price, quantity)
             VALUES ($1, $2, $3, $4)`,
            [projectId, item.product_id, item.negotiated_price, item.quantity || 1]
          );
        }

        // If no approval needed, convert lead to customer
        if (!needsApproval) {
          await db.query(
            `UPDATE leads SET status = 'converted' WHERE id = $1`,
            [lead_id]
          );

          // Create customer record
          await db.query(
            `INSERT INTO customers (lead_id, user_id, subscription_date)
             VALUES ($1, $2, CURRENT_DATE)`,
            [lead_id, req.user.id]
          );
        }

        await db.query('COMMIT');

        res.status(201).json({
          message: `Project created successfully${needsApproval ? ' - Waiting for approval' : ''}`,
          project: projectResult.rows[0],
          needsApproval,
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  approveProject: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, rejection_reason } = req.body; // action: 'approve' or 'reject'

      // Check if project exists and is waiting for approval
      const projectResult = await db.query(
        'SELECT * FROM projects WHERE id = $1 AND status = $2',
        [id, 'waiting_approval']
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found or not waiting for approval' });
      }

      const project = projectResult.rows[0];

      if (action === 'approve') {
        await db.query('BEGIN');

        try {
          // Update project status
          await db.query(
            `UPDATE projects 
             SET status = 'approved', 
                 approved_by = $1, 
                 approval_date = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [req.user.id, id]
          );

          // Update lead status
          await db.query(
            `UPDATE leads SET status = 'converted' WHERE id = $1`,
            [project.lead_id]
          );

          // Create customer record
          await db.query(
            `INSERT INTO customers (lead_id, user_id, subscription_date)
             VALUES ($1, $2, CURRENT_DATE)`,
            [project.lead_id, project.user_id]
          );

          await db.query('COMMIT');

          res.json({
            message: 'Project approved successfully',
          });
        } catch (error) {
          await db.query('ROLLBACK');
          throw error;
        }
      } else if (action === 'reject') {
        await db.query(
          `UPDATE projects 
           SET status = 'rejected', 
               rejection_reason = $1
           WHERE id = $2`,
          [rejection_reason, id]
        );

        res.json({
          message: 'Project rejected successfully',
        });
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = projectController;