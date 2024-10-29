const mainRouter = require('express').Router();

const utilisateursRoutes = require('./administrations/utilisateur_routes')
const authRoutes = require('./auth_routes');
const profilsRouter = require('./administrations/profil_routes');
const rolesRouter = require('./administrations/role_routes');
const typePartenaireRouter = require('./type_partenaire/type_partenaire_routes');
const partenaireRouter = require('./partenaire/partenaire_routes');
const etat_civilsRouter = require('./etat_civil/etat_civil_routes');
const sexesRouter = require('./sexe/sexe_routes');
const PartenaireRouter = require('./partenaire_route');

const articles_routes = require('./stock/Articles.routes');
const categories_routes = require('./stock/Categories.routes');
const entrees_routes = require('./stock/entrees.routes');
const sorties_routes = require('./stock/sorties.routes');
const stock_routes = require('./stock/stock.routes');
const inventaire_routes = require('./stock/inventaire.routes')

const absenceRouter = require('./pointage/absences');
const presenceRouter = require('./pointage/presences');
const nutrimentRouter = require('./gest_alimentation/nutriment/nutriment_routes');
const categorieLapinRouter = require('./gest_alimentation/categorie_lapin/categorie_lapin_routes');
const maladie_routes = require('./maladie_route');
const regime_routes = require('./regime_route');
const CarrieresRouter = require('./carrieres_routes')
const CotationsRouter = require('./cotations_routes')
const EvaluationsRouter = require('./evaluation_routes')
const ContributionRouter = require('./contribution_routes');
const lapinRouter = require('./gest_alimentation/lapin/lapin_routes');
const planNutritionnelRouter = require('./gest_alimentation/plan_nutritionnel/plan_nutritionnel_routes');
const provinceRouter = require('./province/provinces_routes');
const communeRouter = require('./commune/commune_routes');
const zoneRouter = require('./zone/zone_routes');
const collineRouter = require('./colline/colline_routes');
const nationaliteRouter = require('./nationalite/nationalite_routes');
const FactureRouter = require('./Facture_routes');
const PaiementRouter = require('./Paiement_routes');
const lapinRegimeRouter = require('./lapin_regime/lapin_regime_routes');
const lapinTraitementRouter = require('./lapin_traitement/lapin_traitement_routes');
const statutTraitementRouter = require('./statut_traitement/statut_traitement_routes');
const Option_SelecteRouter = require('./Option_Selecte/Option_Selecteroutes');
const VaccinationRouter = require('./vaccination');
const VaccinationLapinRoute = require('./vaccination/VaccinationLapin');
const AccouplementLapinRoute = require('./vaccination/AccouplementLapin');
const DepenseRouter = require('./Depense/index');
const ContratRouter = require('./Contrat/index');
const lapinTraitementHistoriqueRouter = require('./lapin_traitement/lapin_traitement_historique_routes');
const statutRegimeRouter = require('./lapin_regime/statut_regime_routes');
const lapinRegimeHistoriqueRouter = require('./lapin_regime/lapin_regime_historique_routes');
const ActionEtapeRouter = require('./ActionEtape/index');
const dashboardRouter = require('./dashboard/dashboard');
const statusEmployeRouter=require('./dashboard/employes_status')


const demandeLapinRouter = require('./demande/demande_lapin');
const reproductionRouter = require('./reproduction/reproduction_routes');
const DemandeHistoriqueRouter = require('./DemandeHistorique');
const { strategy } = require('sharp');


mainRouter.use(authRoutes);
mainRouter.use(utilisateursRoutes);
mainRouter.use(profilsRouter)
mainRouter.use(rolesRouter)
mainRouter.use(typePartenaireRouter)
mainRouter.use(partenaireRouter)
mainRouter.use(etat_civilsRouter)
mainRouter.use(sexesRouter)
mainRouter.use(PartenaireRouter)
mainRouter.use(articles_routes)
mainRouter.use(categories_routes)
mainRouter.use(absenceRouter)
mainRouter.use(presenceRouter)
mainRouter.use(nutrimentRouter)
mainRouter.use(categorieLapinRouter)
mainRouter.use(maladie_routes)
mainRouter.use(regime_routes)
mainRouter.use(CarrieresRouter)
mainRouter.use(CotationsRouter)
mainRouter.use(EvaluationsRouter)
mainRouter.use(ContributionRouter)
mainRouter.use(lapinRouter)
// Stock
mainRouter.use(entrees_routes)
mainRouter.use(sorties_routes)
mainRouter.use(stock_routes)
mainRouter.use(inventaire_routes)

mainRouter.use(planNutritionnelRouter)
mainRouter.use(provinceRouter)
mainRouter.use(communeRouter)
mainRouter.use(zoneRouter)
mainRouter.use(collineRouter)
mainRouter.use(nationaliteRouter)
//
mainRouter.use(FactureRouter)
mainRouter.use(PaiementRouter)
//
mainRouter.use(Option_SelecteRouter)
mainRouter.use(VaccinationRouter)
mainRouter.use(VaccinationLapinRoute)
mainRouter.use(AccouplementLapinRoute)
mainRouter.use(DepenseRouter)
mainRouter.use(DemandeHistoriqueRouter)



mainRouter.use(ContratRouter)
mainRouter.use(ActionEtapeRouter)

//

mainRouter.use(lapinRegimeRouter)
mainRouter.use(lapinTraitementRouter)
mainRouter.use(statutTraitementRouter)
mainRouter.use(lapinTraitementHistoriqueRouter)
mainRouter.use(statutRegimeRouter)
mainRouter.use(lapinRegimeHistoriqueRouter)

mainRouter.use(demandeLapinRouter)

mainRouter.use(reproductionRouter)

mainRouter.use(statusEmployeRouter)

// 

mainRouter.use(dashboardRouter);
module.exports = mainRouter;