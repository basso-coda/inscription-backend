const communeRouter = require('express').Router();
const CommuneController = require('../../controllers/communes/Commune_controller');
const verifToken = require('../../middlewares/verifyToken');

communeRouter.use(verifToken);

communeRouter.get('/communes', CommuneController.getCommunes);

module.exports = communeRouter
