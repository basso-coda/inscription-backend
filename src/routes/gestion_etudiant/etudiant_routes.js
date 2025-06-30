const etudiantRouter = require('express').Router();
const EtudiantController = require('../../controllers/gestion_etudiant/Etudiant_controller');
const verifToken = require('../../middlewares/verifyToken');

etudiantRouter.use(verifToken);

etudiantRouter.get('/etudiants', EtudiantController.getEtudiants);
etudiantRouter.get('/etudiants/:ID_ETUDIANT', EtudiantController.getEtudiant)

module.exports = etudiantRouter
