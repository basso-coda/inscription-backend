const mainRouter = require('express').Router();

const utilisateursRoutes = require('./administrations/utilisateur_routes')
const profilsRouter = require('./administrations/profil_routes');
const rolesRouter = require('./administrations/role_routes');
const etat_civilsRouter = require('./etat_civil/etat_civil_routes');
const sexesRouter = require('./sexe/sexe_routes');

const provinceRouter = require('./province/provinces_routes');
const communeRouter = require('./commune/commune_routes');
const zoneRouter = require('./zone/zone_routes');
const collineRouter = require('./colline/colline_routes');
const nationaliteRouter = require('./nationalite/nationalite_routes');
const { strategy } = require('sharp');
const authRouter = require('./auth_routes');


mainRouter.use(authRouter);
mainRouter.use(utilisateursRoutes);
mainRouter.use(profilsRouter)
mainRouter.use(rolesRouter)
mainRouter.use(etat_civilsRouter)
mainRouter.use(sexesRouter)
mainRouter.use(provinceRouter)
mainRouter.use(communeRouter)
mainRouter.use(zoneRouter)
mainRouter.use(collineRouter)
mainRouter.use(nationaliteRouter)

module.exports = mainRouter;