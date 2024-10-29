const etat_civilsRouter = require('express').Router();
const EtatCivilController = require('../../controllers/etat_civil/Etat_civil_controller');
const verifToken = require('../../middlewares/verifyToken');

etat_civilsRouter.use(verifToken);

etat_civilsRouter.get('/etat_civils', EtatCivilController.getEtatCivils);

module.exports = etat_civilsRouter
