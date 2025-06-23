const profilRoleRouter = require('express').Router();
const ProfilRoleController = require('../../controllers/administrations/Profil_role_controller');
const verifToken = require('../../middlewares/verifyToken');

profilRoleRouter.use(verifToken);

profilRoleRouter.get('/profil-roles', ProfilRoleController.getProfilRoles);
profilRoleRouter.get('/profil-roles/:ID_PROFIL_ROLE', ProfilRoleController.getProfilRole)

module.exports = profilRoleRouter
