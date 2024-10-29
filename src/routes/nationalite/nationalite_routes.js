const nationaliteRouter = require('express').Router();
const NationaliteController = require('../../controllers/nationalite/Nationalite_controller');
const verifToken = require('../../middlewares/verifyToken');

nationaliteRouter.use(verifToken);

nationaliteRouter.get('/nationalites', NationaliteController.getNationalites);

module.exports = nationaliteRouter
