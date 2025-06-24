const paiementRouter = require('express').Router();
const PaiementController = require('../../controllers/gestion_paiement/Paiement_controller');
const verifToken = require('../../middlewares/verifyToken');

paiementRouter.use(verifToken);

paiementRouter.post('/paiement-callback', PaiementController.enregistrerPaiementCallback);

module.exports = paiementRouter
