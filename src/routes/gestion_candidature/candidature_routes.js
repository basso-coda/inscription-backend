const candidatureRouter = require('express').Router();
const CandidatureController = require('../../controllers/gestion_etudiant/Candidature_controller');
const verifToken = require('../../middlewares/verifyToken');

candidatureRouter.use(verifToken);

candidatureRouter.get('/candidatures', CandidatureController.getCandidatures);
candidatureRouter.post('/candidatures', CandidatureController.createCandidature);
candidatureRouter.get('/candidatures/:ID_CANDIDATURE', CandidatureController.getCandidature);
candidatureRouter.get('/mes-demandes/:utilisateurId', CandidatureController.getCandidatureParUtilisateur);
candidatureRouter.post('/refuser-demande/:id', CandidatureController.refuserCandidature);
candidatureRouter.post('/approuver-demande/:id', CandidatureController.approuverCandidature);
candidatureRouter.put('/change-statut/:id', CandidatureController.mettreEnTraitementCandidature)
// candidatureRouter.post('/type_documents/delete', CandidatureController.deleteTypeDocument);
candidatureRouter.get('/paiements', CandidatureController.getPaiements)

module.exports = candidatureRouter
