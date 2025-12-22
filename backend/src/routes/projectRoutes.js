const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);

// Only managers can approve/reject projects
router.post('/:id/approve', authorizeRoles('manager'), projectController.approveProject);

module.exports = router;