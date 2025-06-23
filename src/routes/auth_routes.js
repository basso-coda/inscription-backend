const express = require('express');
const AuthController = require('../controllers/Auth_controller');
const authRouter = express.Router();

authRouter.post('/login', AuthController.login);
authRouter.post('/login-candidat', AuthController.loginCandidat);
authRouter.post('/change-password', AuthController.changePassword);
authRouter.post('/creation-compte', AuthController.createAccount);

module.exports = authRouter
