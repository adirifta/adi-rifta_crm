const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Only managers can modify products
router.post('/', authorizeRoles('manager'), productController.createProduct);
router.put('/:id', authorizeRoles('manager'), productController.updateProduct);
router.delete('/:id', authorizeRoles('manager'), productController.deleteProduct);

module.exports = router;