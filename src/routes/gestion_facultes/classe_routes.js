const classeRouter = require('express').Router();
const ClasseController = require('../../controllers/gestion_facultes/Classe_controller');
const verifToken = require('../../middlewares/verifyToken');

classeRouter.use(verifToken);

classeRouter.get('/classes', ClasseController.getClasses);
classeRouter.post('/classes', ClasseController.createClasse);
classeRouter.get('/classes/:ID_CLASSE', ClasseController.getClasse);
classeRouter.put('/classes/:ID_CLASSE', ClasseController.updateClasse);
classeRouter.post('/classes/delete', ClasseController.deleteClasse);

module.exports = classeRouter
