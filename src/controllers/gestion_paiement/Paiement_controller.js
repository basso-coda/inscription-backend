import PDFDocument from "pdfkit";
import getStream from "get-stream";
const Candidature = require('../../db/models/gestion_etudiant/Candidature');
const TypePaiement = require('../../db/models/gestion_paiement/TypePaiement')
const Paiement = require('../../db/models/gestion_paiement/Paiement')
const Etudiant = require('../../db/models/gestion_etudiant/Etudiant')
const { Op } = require("sequelize");
const emailSender = require('../../utils/emailSender');


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
        const dejaEtudiant = await Etudiant.findOne({ where: { CANDIDATURE_ID: candidatureId } });
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

        // PDF invoice generator
        async function generateInvoiceBuffer (candidature, typePaiement, numeroMatricule) {
            const doc = new PDFDocument({ margin: 50 });

            // Couleur principale
            const primaryColor = "#005baa";

            // Référence facture unique
            const referenceFacture = `FACT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`;

            // ===== Titre principal =====
            doc.fontSize(20)
            .fillColor(primaryColor)
            .text("Bujumbura International University", { align: "center" })
            .moveDown(0.5);

            doc.fontSize(14)
            .fillColor("black")
            .text("FACTURE DE PAIEMENT", { align: "center", underline: true })
            .moveDown(1.5);

            // Référence + date
            doc.fontSize(12).fillColor("black")
            .text(`Référence facture : ${referenceFacture}`)
            .text(`Date d’émission : ${new Date().toLocaleDateString("fr-FR")}`)
            .moveDown(1);

            // ===== Encadré infos étudiant =====
            doc.rect(50, doc.y, 500, 80).strokeColor(primaryColor).stroke();
            doc.fontSize(12).fillColor("black");
            doc.text(`Nom complet : ${candidature.NOM} ${candidature.PRENOM}`, 60, doc.y + 5);
            doc.text(`Numéro matricule : ${numeroMatricule}`, 60);
            doc.text(`Email : ${candidature.EMAIL_PRIVE}`, 60);

            doc.moveDown(2);

            // ===== Encadré détails paiement =====
            doc.fontSize(14).fillColor(primaryColor).text("Détails du paiement", { underline: true });
            doc.rect(50, doc.y, 500, 80).strokeColor(primaryColor).stroke();
            doc.fontSize(12).fillColor("black");
            doc.text(`Description : ${typePaiement.DESCRIPTION}`, 60, doc.y + 5);
            doc.text(`Montant payé : ${typePaiement.MONTANT} Fbu`, 60);
            doc.text(`Date de paiement : ${new Date().toLocaleDateString("fr-FR")}`, 60);

            doc.moveDown(2);

            // ===== Message final =====
            doc.fontSize(12).fillColor("black").text(
                "Nous vous remercions pour votre paiement. Cette facture confirme la validation de votre inscription à BIU. Veuillez conserver ce document comme preuve officielle.",
                { align: "justify" }
            );

            doc.moveDown(3);

            // ===== Pied de page =====
            doc.moveTo(50, 750).lineTo(550, 750).strokeColor(primaryColor).stroke();
            doc.fontSize(10).fillColor("#666").text(
                "Bujumbura International University - www.biu.bi\n© " + new Date().getFullYear(),
                50, 760, { align: "center" }
            );

            doc.end();
            return await getStream.buffer(doc);
        }

        const pdfBuffer = await generateInvoiceBuffer(candidature, typePaiement, dejaEtudiant ? dejaEtudiant.NUMERO_MATRICULE : numeroMatricule);

        // Email
        await emailSender(
            { 
                to: candidature.EMAIL_PRIVE, 
                subject: "Confirmation de votre paiement",
                attachments: [
                    {
                        filename: `Facture_${dejaEtudiant ? dejaEtudiant.NUMERO_MATRICULE : numeroMatricule}.pdf`,
                        content: pdfBuffer
                    }
                ] 
            },
            "paiement_success",
            {
                candidat: `${candidature.NOM} ${candidature.PRENOM}`,
                montant: typePaiement.MONTANT,
                description: typePaiement.DESCRIPTION,
                matricule: dejaEtudiant ? dejaEtudiant.NUMERO_MATRICULE : numeroMatricule
            }
        );

        res.status(200).json({ message: "Paiement traité avec succès." });

    } catch (error) {
        console.error("Erreur dans le callback paiement:", error);
        res.status(500).json({ message: "Erreur interne lors du traitement du paiement." });
    }
};


module.exports = { enregistrerPaiementCallback };
