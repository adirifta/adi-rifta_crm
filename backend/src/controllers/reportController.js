const db = require('../config/database');
const XLSX = require('xlsx');

const reportController = {
  getSalesReport: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      
      let query = `
        SELECT 
          u.name as sales_name,
          COUNT(DISTINCT l.id) as total_leads,
          COUNT(DISTINCT CASE WHEN p.status = 'approved' THEN p.id END) as approved_projects,
          COUNT(DISTINCT c.id) as total_customers,
          COALESCE(SUM(pi.subtotal), 0) as total_sales_value
        FROM users u
        LEFT JOIN leads l ON u.id = l.user_id
        LEFT JOIN projects p ON u.id = p.user_id
        LEFT JOIN customers c ON u.id = c.user_id
        LEFT JOIN project_items pi ON p.id = pi.project_id AND p.status = 'approved'
        WHERE u.role = 'sales'
      `;
      const params = [];
      let paramCount = 1;

      // Date filter
      if (start_date && end_date) {
        query += `
          AND (
            (l.created_at BETWEEN $${paramCount} AND $${paramCount + 1}) OR
            (p.created_at BETWEEN $${paramCount} AND $${paramCount + 1}) OR
            (c.created_at BETWEEN $${paramCount} AND $${paramCount + 1})
          )
        `;
        params.push(start_date, end_date);
        paramCount += 2;
      }

      // Filter by user role
      if (req.user.role === 'sales') {
        query += ` AND u.id = $${paramCount}`;
        params.push(req.user.id);
      }

      query += `
        GROUP BY u.id, u.name
        ORDER BY total_sales_value DESC
      `;

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  exportSalesReport: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      
      let query = `
        SELECT 
          u.name as "Sales Name",
          COUNT(DISTINCT l.id) as "Total Leads",
          COUNT(DISTINCT CASE WHEN p.status = 'approved' THEN p.id END) as "Approved Projects",
          COUNT(DISTINCT c.id) as "Total Customers",
          COALESCE(SUM(pi.subtotal), 0) as "Total Sales Value"
        FROM users u
        LEFT JOIN leads l ON u.id = l.user_id
        LEFT JOIN projects p ON u.id = p.user_id
        LEFT JOIN customers c ON u.id = c.user_id
        LEFT JOIN project_items pi ON p.id = pi.project_id AND p.status = 'approved'
        WHERE u.role = 'sales'
      `;
      const params = [];
      let paramCount = 1;

      // Date filter
      if (start_date && end_date) {
        query += `
          AND (
            (l.created_at BETWEEN $${paramCount} AND $${paramCount + 1}) OR
            (p.created_at BETWEEN $${paramCount} AND $${paramCount + 1}) OR
            (c.created_at BETWEEN $${paramCount} AND $${paramCount + 1})
          )
        `;
        params.push(start_date, end_date);
        paramCount += 2;
      }

      // Filter by user role
      if (req.user.role === 'sales') {
        query += ` AND u.id = $${paramCount}`;
        params.push(req.user.id);
      }

      query += `
        GROUP BY u.id, u.name
        ORDER BY "Total Sales Value" DESC
      `;

      const result = await db.query(query, params);

      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(result.rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

      // Generate buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for download
      const filename = `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getLeadsByStatus: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      
      let query = `
        SELECT 
          status,
          COUNT(*) as count,
          TO_CHAR(created_at, 'YYYY-MM') as month
        FROM leads
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      // Date filter
      if (start_date && end_date) {
        query += ` AND created_at BETWEEN $${paramCount} AND $${paramCount + 1}`;
        params.push(start_date, end_date);
        paramCount += 2;
      }

      // Filter by user role
      if (req.user.role === 'sales') {
        query += ` AND user_id = $${paramCount}`;
        params.push(req.user.id);
      }

      query += `
        GROUP BY status, TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month, status
      `;

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = reportController;