const db = require('../config/database');

const customerController = {
  getAllCustomers: async (req, res) => {
    try {
      let query = `
        SELECT c.*, 
               l.name as customer_name, 
               l.contact as customer_contact,
               l.address as customer_address,
               u.name as sales_name,
               COUNT(cs.id) as total_services,
               MAX(cs.end_date) as latest_end_date
        FROM customers c
        LEFT JOIN leads l ON c.lead_id = l.id
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN customer_services cs ON c.id = cs.customer_id AND cs.status = 'active'
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      // Filter by user role
      if (req.user.role === 'sales') {
        query += ` AND c.user_id = $${paramCount}`;
        params.push(req.user.id);
        paramCount++;
      }

      query += `
        GROUP BY c.id, l.name, l.contact, l.address, u.name
        ORDER BY c.created_at DESC
      `;

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getCustomerById: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get customer details
      let query = `
        SELECT c.*, 
               l.name as customer_name, 
               l.contact as customer_contact,
               l.address as customer_address,
               u.name as sales_name
        FROM customers c
        LEFT JOIN leads l ON c.lead_id = l.id
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
      `;
      const params = [id];

      if (req.user.role === 'sales') {
        query += ` AND c.user_id = $2`;
        params.push(req.user.id);
      }

      const customerResult = await db.query(query, params);
      
      if (customerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Get customer services
      const servicesResult = await db.query(
        `SELECT cs.*, p.name as product_name, p.price as regular_price
         FROM customer_services cs
         LEFT JOIN products p ON cs.product_id = p.id
         WHERE cs.customer_id = $1
         ORDER BY cs.start_date DESC`,
        [id]
      );

      const customer = customerResult.rows[0];
      customer.services = servicesResult.rows;

      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addCustomerService: async (req, res) => {
    try {
      const { customer_id, product_id, start_date, end_date } = req.body;
      
      // Check if customer exists and belongs to user
      let customerCheckQuery = 'SELECT * FROM customers WHERE id = $1';
      const customerCheckParams = [customer_id];
      
      if (req.user.role === 'sales') {
        customerCheckQuery += ' AND user_id = $2';
        customerCheckParams.push(req.user.id);
      }

      const customerResult = await db.query(customerCheckQuery, customerCheckParams);
      
      if (customerResult.rows.length === 0) {
        return res.status(404).json({ error: 'Customer not found or access denied' });
      }

      const result = await db.query(
        `INSERT INTO customer_services (customer_id, product_id, start_date, end_date)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [customer_id, product_id, start_date, end_date]
      );

      res.status(201).json({
        message: 'Service added successfully',
        service: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = customerController;