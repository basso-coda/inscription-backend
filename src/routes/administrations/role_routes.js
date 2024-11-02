const rolesRouter = require('express').Router();
const RoleController = require('../../controllers/administrations/Role_controller');
const verifToken = require('../../middlewares/verifyToken');

rolesRouter.use(verifToken);

rolesRouter.get('/roles', RoleController.getRoles);
rolesRouter.post('/roles', RoleController.createRole);
rolesRouter.get('/roles/:ID_role', RoleController.getRole);
rolesRouter.put('/roles/:ID_role', RoleController.updateRole);
rolesRouter.post('/roles/delete', RoleController.deleteRole);

module.exports = rolesRouter
