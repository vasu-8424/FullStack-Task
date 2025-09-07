const express = require('express');
const { registerController, loginController, meController } = require('../services/auth.controller');
const { authMiddleware } = require('../utils/auth.middleware');

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/me', authMiddleware, meController);

module.exports = router;


