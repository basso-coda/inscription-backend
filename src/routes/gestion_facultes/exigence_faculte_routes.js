const exigenceFaculteRouter = require('express').Router();
const ExigenceFaculteController = require('../../controllers/gestion_facultes/Exigence_faculte_controller');
const verifToken = require('../../middlewares/verifyToken');

exigenceFaculteRouter.use(verifToken);

exigenceFaculteRouter.get('/exigences-facultes', ExigenceFaculteController.getExigenceFacultes);
exigenceFaculteRouter.get('/exigences-facultes/:ID_EXIGENCE_FACULTE', ExigenceFaculteController.getExigenceFaculte);
exigenceFaculteRouter.put('/exigences-facultes/:ID_EXIGENCE_FACULTE', ExigenceFaculteController.updateExigenceFaculte)

module.exports = exigenceFaculteRouter
