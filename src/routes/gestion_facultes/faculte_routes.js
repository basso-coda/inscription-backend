const faculteRouter = require('express').Router();
const FaculteController = require('../../controllers/gestion_facultes/Faculte_controller');
const verifToken = require('../../middlewares/verifyToken');

faculteRouter.use(verifToken);

faculteRouter.get('/facultes', FaculteController.getFacultes);
faculteRouter.post('/facultes', FaculteController.createFaculte);
faculteRouter.get('/facultes/:ID_FACULTE', FaculteController.getFaculte);
faculteRouter.put('/facultes/:ID_FACULTE', FaculteController.updateFaculte);
faculteRouter.post('/facultes/delete', FaculteController.deleteFaculte);

module.exports = faculteRouter
