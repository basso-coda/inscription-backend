const express = require('express');
const AuthController = require('../controllers/Auth_controller');
const authRouter = express.Router();

authRouter.post('/login', AuthController.login);
authRouter.post('/change-password', AuthController.changePassword);

module.exports = authRouter
