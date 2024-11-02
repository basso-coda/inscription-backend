const profilsRouter = require('express').Router();
const ProfilController = require('../../controllers/administrations/Profil_controller');
const verifToken = require('../../middlewares/verifyToken');

profilsRouter.use(verifToken);

profilsRouter.get('/profils', ProfilController.getProfils);
profilsRouter.post('/profils', ProfilController.createProfil);
profilsRouter.get('/profils/:ID_profil', ProfilController.getProfil);
profilsRouter.put('/profils/:ID_profil', ProfilController.updateProfil);
profilsRouter.post('/profils/delete', ProfilController.deleteProfil);

module.exports = profilsRouter

