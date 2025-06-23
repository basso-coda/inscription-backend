const yup = require('yup');
const bcrypt = require('bcrypt');
const { ValidationError, Op } = require('sequelize');
const Uploader = require('../../utils/Upload');
const { sequelize } = require('../../db/models');
const Candidature = require('../../db/models/gestion_etudiant/Candidature');
const Classe = require('../../db/models/gestion_facultes/Classe');
const Commune = require('../../db/models/communes/Commune_model');
const Sexe = require('../../db/models/sexe/Sexe_model')
const EtatCivil = require('../../db/models/etat_civil/Etat_civil_model')
const Utilisateur = require('../../db/models/administrations/Utilisateur')
const Nationalite = require('../../db/models/nationalite/Nationalite');
const Document = require('../../db/models/gestion_document/Document')
const TypeDocument = require('../../db/models/gestion_document/TypeDocument')
const Departement = require('../../db/models/gestion_facultes/Departement');
const Faculte = require('../../db/models/gestion_facultes/Faculte');
const MotifRejet = require('../../db/models/gestion_motif/MotifRejet');
const Motif = require('../../db/models/gestion_motif/Motif');
const PersonneContact = require('../../db/models/gestion_etudiant/PersonneContact');
const Paiement = require('../../db/models/gestion_paiement/Paiement');
const Etudiant = require('../../db/models/gestion_etudiant/Etudiant');

const getNbreTotalCandidatureParStatut = async (req, res) => {
    try {
        const candidatures = await Candidature.findAll({
            attributes: ['STATUT_CANDIDATURE'],
        });

        const stats = {
            total: candidatures.length,
            statuts: {
                reçue: 0,
                en_cours: 0,
                en_attente_paiement: 0,
                approuvée: 0,
                refusée: 0,
            }
        };

        candidatures.forEach(c => {
            switch (c.STATUT_CANDIDATURE) {
                case 1: stats.statuts.reçue++; break;
                case 2: stats.statuts.en_cours++; break;
                case 3: stats.statuts.en_attente_paiement++; break;
                case 4: stats.statuts.approuvée++; break;
                case 5: stats.statuts.refusée++; break;
                default: break;
            }
        });

        res.json(stats);
    } catch (error) {
        console.error("Erreur statistique :", error);
        res.status(500).json({ message: "Erreur lors du chargement des statistiques." });
    }
}

const getNbreCandidaturesParFaculte = async (req, res) => {
    try {
        const result = await Candidature.findAll({
            attributes: [],
            include:[
                { 
                    model: Classe, 
                    as: 'classe', 
                    include: [
                        { 
                            model: Departement, 
                            as: 'departement', 
                            include: [
                                { 
                                    model: Faculte, 
                                    as: 'faculte' 
                                }
                            ] 
                        }
                    ] 
                },
            ],
            raw: true
        });

        const regrouped = {};

        result.forEach(row => {
            const faculte = row['classe.departement.faculte.DESCRIPTION'];
            if (!regrouped[faculte]) regrouped[faculte] = 0;
            regrouped[faculte]++;
        });

        const response = Object.entries(regrouped).map(([faculte, total]) => ({
            faculte,
            total
        }));

        res.json(response);

    } catch (error) {
        console.error('Erreur dans candidatures par faculte', error);
        res.status(500).json({ message: "Erreur lors du calcul." });
    }
}

const getPaiementsStatistics = async (req, res) => {
    try {
        const paiements = await Paiement.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('ID_PAIEMENT')), 'total_paiements'],
                [sequelize.fn('SUM', sequelize.col('MONTANT')), 'montant_total'],
            ],
            raw: true
        });

        const { total_paiement, montant_total } = paiements[0];

        res.json({
            total_paiement: parseInt(total_paiement),
            montant_total: parseFloat(montant_total || 0),
        });

    } catch (error) {
        console.error('Erreur au niveau des paiements', error);
        res.status(500).json({ message: "Erreur lors du calcul des paiements" });
    }
}

const getTotalEtudiants = async (req, res) => {
    try {
        const totalEtudiants = await Etudiant.count();

        res.json({
            nombre_etudiants: totalEtudiants
        });

    } catch (error) {
        console.error("Erreur total étudiants :", error);
        res.status(500).json({ message: "Erreur lors du comptage des étudiants" });
    }
}

const dashboardInscription = async (req, res) => {
    try {
        const totalCandidatures = await Candidature.count();

        const nombreEtudiants = await Etudiant.count();

        const paiements = await Paiement.findAll();
        const totalAyantPaye = paiements.length;
        const montantTotalPaye = paiements.reduce((total, paiement) => total + paiement.MONTANT, 0);

        res.status(200).json({
            total_candidatures: totalCandidatures,
            nombre_etudiants: nombreEtudiants,
            total_ayant_paye: totalAyantPaye,
            montant_total_paye: montantTotalPaye
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du chargement des données du dashboard.' });
    }
}

const dashboardStatutCandidatures = async (req, res) => {
    try {
        const counts = await Candidature.findAll({
            attributes: ['STATUT_CANDIDATURE', [sequelize.fn('COUNT', '*'), 'count']],
            group: ['STATUT_CANDIDATURE']
        });

        const result = {
            recues: 0,
            en_cours: 0,
            approuvees: 0,
            payees: 0,
            refusees: 0,
        };

        counts.forEach(item => {
            const status = item.STATUT_CANDIDATURE;
            const count = parseInt(item.dataValues.count);
            if (status === 1) result.recues = count;
            else if (status === 2) result.en_cours = count;
            else if (status === 3) result.approuvees = count;
            else if (status === 4) result.payees = count;
            else if (status === 5) result.refusees = count;
        });

        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors du chargement des statuts des candidatures." });
    }
}

module.exports = {
    getNbreTotalCandidatureParStatut,
    getNbreCandidaturesParFaculte,
    getPaiementsStatistics,
    getTotalEtudiants,

    dashboardInscription,
    dashboardStatutCandidatures
}