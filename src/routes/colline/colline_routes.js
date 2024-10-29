const collineRouter = require('express').Router();
const CollineController = require('../../controllers/collines/Colline_controller');
const verifToken = require('../../middlewares/verifyToken');

collineRouter.use(verifToken);

collineRouter.get('/collines', CollineController.getCollines);

module.exports = collineRouter
