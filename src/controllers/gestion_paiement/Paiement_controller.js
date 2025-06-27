const Candidature = require('../../db/models/gestion_etudiant/Candidature');
const TypePaiement = require('../../db/models/gestion_paiement/TypePaiement')
const Paiement = require('../../db/models/gestion_paiement/Paiement')
const Etudiant = require('../../db/models/gestion_etudiant/Etudiant')
const { Op } = require("sequelize");

const enregistrerPaiementCallback = async (req, res) => {
    try {
        const { status, amount, currency, transaction_ref, payment_method, client_token } = req.body;

        if (status !== "success") {
            return res.status(400).json({ message: "Paiement échoué ou annulé." });
        }

        const [candidatureId, typePaiementId] = client_token.split("-").map(val => parseInt(val));

        const candidature = await Candidature.findByPk(candidatureId);
        if (!candidature) return res.status(404).json({ message: "Candidature introuvable." });

        // Vérifier si ce paiement n'a pas déjà été enregistré
        const paiementExistant = await Paiement.findOne({
            where: {
                CANDIDATURE_ID: candidatureId,
                TYPE_PAIEMENT_ID: typePaiementId
            }
        });

        if (paiementExistant) {
            return res.status(409).json({ message: "Paiement déjà enregistré." });
        }

        // Enregistrer le paiement
        const typePaiement = await TypePaiement.findByPk(typePaiementId);

        await Paiement.create({
            DESCRIPTION: typePaiement.DESCRIPTION,
            MONTANT: typePaiement.MONTANT,
            TYPE_PAIEMENT_ID: typePaiementId,
            CANDIDATURE_ID: candidatureId,
            DATE_PAIEMENT: new Date(),
            DATE_INSERTION: new Date()
        });

        // Modifier statut candidature (4 = payé)
        candidature.STATUT_CANDIDATURE = 4;
        await candidature.save();

        // Créer un étudiant uniquement si ce n'est pas encore fait
        const dejaEtudiant = await Etudiant.findOne({ where: { CANDIDAT_ID: candidature.CANDIDAT_ID } });
        if (!dejaEtudiant) {
            const anneeActuelle = new Date().getFullYear();
            const anneeDebutUniversite = 2013;
            const promotion = (anneeActuelle - anneeDebutUniversite + 1).toString().padStart(2, "0");

            const totalEtudiantsCetteAnnee = await Etudiant.count({
                where: {
                    DATE_INSERTION: {
                        [Op.gte]: new Date(`${anneeActuelle}-01-01`),
                        [Op.lte]: new Date(`${anneeActuelle}-12-31`)
                    }
                }
            });
            const numeroIncremental = (totalEtudiantsCetteAnnee + 1).toString().padStart(4, "0");
            const numeroMatricule = `BIU-EED-${promotion}-${numeroIncremental}-${anneeActuelle}`;


            await Etudiant.create({
                CANDIDATURE_ID: candidatureId,
                NUMERO_MATRICULE: numeroMatricule,
                DATE_INSERTION: new Date()
            });
        }

        res.status(200).json({ message: "Paiement traité avec succès." });

    } catch (error) {
        console.error("Erreur dans le callback paiement:", error);
        res.status(500).json({ message: "Erreur interne lors du traitement du paiement." });
    }
};

module.exports = { enregistrerPaiementCallback };
