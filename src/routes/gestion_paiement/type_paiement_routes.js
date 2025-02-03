const typePaiementRouter = require('express').Router();
const TypePaiementController = require('../../controllers/gestion_paiement/TypePaiement_controller');
const verifToken = require('../../middlewares/verifyToken');

typePaiementRouter.use(verifToken);

typePaiementRouter.get('/type_paiements', TypePaiementController.getTypePaiements);
typePaiementRouter.post('/type_paiements', TypePaiementController.createTypePaiement);
typePaiementRouter.get('/type_paiements/:ID_TYPE_PAIEMENT', TypePaiementController.getTypePaiement);
typePaiementRouter.put('/type_paiements/:ID_TYPE_PAIEMENT', TypePaiementController.updateTypePaiement);
typePaiementRouter.post('/type_paiements/delete', TypePaiementController.deleteTypePaiement);

module.exports = typePaiementRouter
