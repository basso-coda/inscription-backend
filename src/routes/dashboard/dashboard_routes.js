const dashboardRouter = require('express').Router();
const DashboardController = require('../../controllers/dashboard/DashboardController');
const verifToken = require('../../middlewares/verifyToken');

dashboardRouter.use(verifToken);

dashboardRouter.get('/candidatures-par-statut', DashboardController.getNbreTotalCandidatureParStatut);
dashboardRouter.get('/dashboard-candidatures-par-faculte', DashboardController.getNbreCandidaturesParFaculte);
dashboardRouter.get('/paiements-statistics', DashboardController.getPaiementsStatistics);
dashboardRouter.get('/total-etudiants', DashboardController.getTotalEtudiants),

dashboardRouter.get('/dashboard-inscription', DashboardController.dashboardInscription);
dashboardRouter.get('/dashboard-statuts-candidatures', DashboardController.dashboardStatutCandidatures);

module.exports = dashboardRouter
