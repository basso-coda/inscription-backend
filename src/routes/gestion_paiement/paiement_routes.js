const paiementRouter = require('express').Router();
const PaiementController = require('../../controllers/gestion_paiement/Paiement_controller');

paiementRouter.post('/api/paiement-callback', PaiementController.enregistrerPaiementCallback);

module.exports = paiementRouter
