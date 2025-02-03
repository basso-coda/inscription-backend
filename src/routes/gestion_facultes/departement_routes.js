const departementRouter = require('express').Router();
const DepartementController = require('../../controllers/gestion_facultes/Departement_controller');
const verifToken = require('../../middlewares/verifyToken');

departementRouter.use(verifToken);

departementRouter.get('/departements', DepartementController.getDepartements);
departementRouter.post('/departements', DepartementController.createDepartement);
departementRouter.get('/departements/:ID_DEPARTEMENT', DepartementController.getDepartement);
departementRouter.put('/departements/:ID_DEPARTEMENT', DepartementController.updateDepartement);
departementRouter.post('/departements/delete', DepartementController.deleteDepartement);

module.exports = departementRouter
