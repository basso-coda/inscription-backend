const sexesRouter = require('express').Router();
const SexeController = require('../../controllers/sexe/Sexe_controller');
const verifToken = require('../../middlewares/verifyToken');

sexesRouter.use(verifToken);

sexesRouter.get('/sexes', SexeController.getSexes);

module.exports = sexesRouter
