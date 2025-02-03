const exigenceRouter = require('express').Router();
const ExigenceController = require('../../controllers/gestion_facultes/Exigence_controller');
const verifToken = require('../../middlewares/verifyToken');

exigenceRouter.use(verifToken);

exigenceRouter.get('/exigences', ExigenceController.getExigences);
exigenceRouter.post('/exigences', ExigenceController.createExigence);
exigenceRouter.get('/exigences/:ID_EXIGENCE', ExigenceController.getExigence);
exigenceRouter.post('/exigences/delete', ExigenceController.deleteExigence);

module.exports = exigenceRouter
