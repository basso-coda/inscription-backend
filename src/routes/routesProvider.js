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
const faculteRouter = require('./gestion_facultes/faculte_routes');
const departementRouter = require('./gestion_facultes/departement_routes');
const classeRouter = require('./gestion_facultes/classe_routes');
const exigenceRouter = require('./gestion_facultes/exigence_routes');
const exigenceFaculteRouter = require('./gestion_facultes/exigence_faculte_routes');
const typeDocumentRouter = require('./gestion_document/type_document_routes');
const typePaiementRouter = require('./gestion_paiement/type_paiement_routes');
const motifRouter = require('./gestion_motifs/motif_routes');
const candidatureRouter = require('./gestion_candidature/candidature_routes');
const dashboardRouter = require('./dashboard/dashboard_routes');
const profilRoleRouter = require('./administrations/profil_role_routes');
const paiementRouter = require('./gestion_paiement/paiement_routes');


mainRouter.use(authRouter);
mainRouter.use(utilisateursRoutes);
mainRouter.use(profilsRouter)
mainRouter.use(rolesRouter)
mainRouter.use(profilRoleRouter)
mainRouter.use(etat_civilsRouter)
mainRouter.use(sexesRouter)
mainRouter.use(provinceRouter)
mainRouter.use(communeRouter)
mainRouter.use(zoneRouter)
mainRouter.use(collineRouter)
mainRouter.use(nationaliteRouter)

// GESTION DES FACULTES
mainRouter.use(faculteRouter)
mainRouter.use(departementRouter)
mainRouter.use(classeRouter)
mainRouter.use(exigenceRouter)
mainRouter.use(exigenceFaculteRouter)

//GESTION DES PAIEMENTS
mainRouter.use(typePaiementRouter)
mainRouter.use(paiementRouter)

// GESTION DES DOCUMENTS
mainRouter.use(typeDocumentRouter)

// GESTION DES MOTIFS
mainRouter.use(motifRouter)

// GESTION DES ETUDIANTS
mainRouter.use(candidatureRouter)

// DASHBOARD
mainRouter.use(dashboardRouter)


module.exports = mainRouter;