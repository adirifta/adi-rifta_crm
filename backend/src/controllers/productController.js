const db = require('../config/database');

const productController = {
  getAllProducts: async (req, res) => {
    try {
      const result = await db.query(
        'SELECT * FROM products ORDER BY created_at DESC'
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT * FROM products WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, description, hpp, margin } = req.body;
      
      const result = await db.query(
        `INSERT INTO products (name, description, hpp, margin)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, description, parseFloat(hpp), parseFloat(margin)]
      );

      res.status(201).json({
        message: 'Product created successfully',
        product: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, hpp, margin } = req.body;
      
      const result = await db.query(
        `UPDATE products 
         SET name = $1, description = $2, hpp = $3, margin = $4
         WHERE id = $5
         RETURNING *`,
        [name, description, parseFloat(hpp), parseFloat(margin), id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        message: 'Product updated successfully',
        product: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        'DELETE FROM products WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        message: 'Product deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = productController;