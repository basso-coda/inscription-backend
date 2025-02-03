const motifRouter = require('express').Router();
const MotifController = require('../../controllers/gestion_motifs/Motif_controller');
const verifToken = require('../../middlewares/verifyToken');

motifRouter.use(verifToken);

motifRouter.get('/motifs', MotifController.getMotifs);
motifRouter.post('/motifs', MotifController.createMotif);
motifRouter.get('/motifs/:ID_MOTIF', MotifController.getMotif);
motifRouter.put('/motifs/:ID_MOTIF', MotifController.updateMotif);
motifRouter.post('/motifs/delete', MotifController.deleteMotif);

module.exports = motifRouter
