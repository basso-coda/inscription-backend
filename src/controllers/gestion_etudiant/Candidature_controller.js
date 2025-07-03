const yup = require('yup');
const bcrypt = require('bcrypt');
const { ValidationError, Op } = require('sequelize');
const Uploader = require('../../utils/Upload');

const Candidature = require('../../db/models/gestion_etudiant/Candidature');
const Classe = require('../../db/models/gestion_facultes/Classe');
const Commune = require('../../db/models/communes/Commune_model');
const Sexe = require('../../db/models/sexe/Sexe_model')
const EtatCivil = require('../../db/models/etat_civil/Etat_civil_model')
const Utilisateur = require('../../db/models/administrations/Utilisateur')
const Nationalite = require('../../db/models/nationalite/Nationalite');
const Document = require('../../db/models/gestion_document/Document')
const TypeDocument = require('../../db/models/gestion_document/TypeDocument')

const emailSender = require('../../utils/emailSender');
const { sequelize } = require('../../db/models');
const Departement = require('../../db/models/gestion_facultes/Departement');
const Faculte = require('../../db/models/gestion_facultes/Faculte');
const MotifRejet = require('../../db/models/gestion_motif/MotifRejet');
const Motif = require('../../db/models/gestion_motif/Motif');
const PersonneContact = require('../../db/models/gestion_etudiant/PersonneContact');
const Paiement = require('../../db/models/gestion_paiement/Paiement');
const TypePaiement = require('../../db/models/gestion_paiement/TypePaiement');


yup.setLocale({
    mixed: {
        required: 'Ce champ est obligatoire',
        notType: 'Ce champ est obligatoire'
    }
});

/**
 * Recupérer la liste des candidatures
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getCandidatures = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search, STATUT_CANDIDATURE } = req.query

        const defaultSortDirection = "DESC"

        const sortColumns = {
            candidatures: {
                as: "candidature",
                fields: {
                    ID_CANDIDATURE: "ID_CANDIDATURE",
                    CANDIDAT_ID: "CANDIDAT_ID",
                    ANNEE_ACADEMIQUE: "ANNEE_ACADEMIQUE",
                    CLASSE_ID: "CLASSE_ID",
                    NOM: "NOM",
                    PRENOM: "PRENOM",
                    DATE_NAISSANCE: "DATE_NAISSANCE",
                    NATIONALITE_ID: "NATIONALITE_ID",
                    NUM_CARTE_IDENTITE: "NUM_CARTE_IDENTITE",
                    COMMUNE_DELIVRANCE: "COMMUNE_DELIVRANCE",
                    DATE_DELIVRANCE: "DATE_DELIVRANCE",
                    SEXE_ID: "SEXE_ID",
                    ETAT_CIVIL_ID: "ETAT_CIVIL_ID",
                    EMAIL_PRIVE: "EMAIL_PRIVE",
                    NUMERO_TELEPHONE_PRIVE: "NUMERO_TELEPHONE_PRIVE",
                    ADRESSE_RESIDENCE: "ADRESSE_RESIDENCE",
                    NOM_DERNIERE_ECOLE_FREQUENTEE: "NOM_DERNIERE_ECOLE_FREQUENTEE",
                    NOTE_DERNIERE_ECOLE_SECONDAIRE_FREQUENTEE: "NOTE_DERNIERE_ECOLE_SECONDAIRE_FREQUENTEE",
                    NOTE_EXAMEN_D_ETAT: "NOTE_EXAMEN_D_ETAT",
                    STATUT_CANDIDATURE: "STATUT_CANDIDATURE",
                    SECRETAIRE_ID: "SECRETAIRE_ID",
                    DATE_INSERTION: "DATE_INSERTION"
                }
            },
        }

        let orderColumn, orderDirection
        // sorting
        let sortModel

        if (sortField) {
            for (let key in sortColumns) {
                if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                    sortModel = {
                        model: key,
                        as: sortColumns[key].as
                    }

                    orderColumn = sortColumns[key].fields[sortField]

                    break
                }
            }
        }

        if (!orderColumn || !sortModel) {
            orderColumn = sortColumns.candidatures.fields.ID_CANDIDATURE

            sortModel = {
                model: 'candidature',
                as: sortColumns.candidatures.as
            }

        }

        // ordering
        if (sortOrder == 1) {
            orderDirection = 'ASC'
        } else if (sortOrder == -1) {
            orderDirection = 'DESC'
        } else {
            orderDirection = defaultSortDirection
        }

        // searching
        const globalSearchColumns = [
            "ID_CANDIDATURE",
            "CANDIDAT_ID",
            "ANNEE_ACADEMIQUE",
            "CLASSE_ID",
            "NOM",
            "PRENOM",
            "DATE_NAISSANCE",
            "NATIONALITE_ID",
            "NUM_CARTE_IDENTITE",
            "COMMUNE_DELIVRANCE",
            "DATE_DELIVRANCE",
            "SEXE_ID",
            "ETAT_CIVIL_ID",
            "EMAIL_PRIVE",
            "NUMERO_TELEPHONE_PRIVE",
            "ADRESSE_RESIDENCE",
            "NOM_DERNIERE_ECOLE_FREQUENTEE",
            "NOTE_DERNIERE_ECOLE_SECONDAIRE_FREQUENTEE",
            "NOTE_EXAMEN_D_ETAT",
            "STATUT_CANDIDATURE",
            "SECRETAIRE_ID",
            "DATE_INSERTION",
            "$candidat.NOM$",
            "$candidat.PRENOM$",
            "$classe.DESCRIPTION$",
            "$nationalite.NOM_NATIONALITE$",
            "$etat_civil.DESCRIPTION",
            "$secretaire.NOM$",
            "$secretaire.PRENOM$",
            "$sexe.SEXE_DESCRIPTION$"
        ]

        let globalSearchWhereLike = {}

        if (search && search.trim() != "") {
            const searchWildCard = {}

            globalSearchColumns.forEach(column => {
                searchWildCard[column] = {
                    [Op.substring]: search
                }
            })

            globalSearchWhereLike = {
                [Op.or]: searchWildCard
            }
        }

        if (STATUT_CANDIDATURE) {
            globalSearchWhereLike[Op.and] = { STATUT_CANDIDATURE }
        }

        const data = await Candidature.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[orderColumn, orderDirection]],
            where: { ...globalSearchWhereLike, },
            include: [
                { model: Utilisateur, as: 'candidat' }, 
                { model: Classe, as: 'classe', include: [{ model: Departement, as: 'departement', include: [{ model: Faculte, as: 'faculte' }] }] },
                { model: Sexe, as: 'sexe' },
                { model: Nationalite, as: 'nationalite' },
                { model: EtatCivil, as: 'etat_civil' },
                { model: Utilisateur, as: 'secretaire' },
                { model: Document, as: 'documents', include: [{ model: TypeDocument, as: 'type_document' }] },
                { model: PersonneContact, as: 'personnes_contact' }
            ]
        });

        res.json({
            httpStatus: 200,
            message: 'Candidatures recupérés avec succès',
            data
        });
    } catch (error) {
        console.error(error);

        res.json({
            // message: 'Erreur interne du serveur',
            message: error.message,
            httpStatus: 500,
            data: null
        })
    }
}


/**
 * Créer une candidature
 * @param {Express.Request} req
 * @param {Express.Response} res
 */

const createCandidature = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const candidatureSchema = yup.lazy(() =>
            yup.object({
                CANDIDAT_ID: yup.number().required(),
                ANNEE_ACADEMIQUE: yup.string().required(),
                CLASSE_ID: yup.number().required(),
                NOM: yup.string().required(),
                PRENOM: yup.string().required(),
                DATE_NAISSANCE: yup.date().required(),
                NATIONALITE_ID: yup.number().required(),
                NUM_CARTE_IDENTITE: yup.string().required(),
                COMMUNE_DELIVRANCE: yup.string().required(),
                DATE_DELIVRANCE: yup.date().required(),
                EMAIL_PRIVE: yup.string().email().required(),
                NUMERO_TELEPHONE_PRIVE: yup.string().required(),
                ADRESSE_RESIDENCE: yup.string().required(),
                NOM_DERNIERE_ECOLE_FREQUENTEE: yup.string().required(),
                NOTE_DERNIERE_ECOLE_SECONDAIRE_FREQUENTEE: yup.number().required(),
                NOTE_EXAMEN_D_ETAT: yup.number().required(),
                SEXE_ID: yup.number().required(),
                ETAT_CIVIL_ID: yup.number().required(),
                TERMS_ACCEPTED: yup.boolean().required()
            })
        );

        let files = req.files || {};
        let data = await candidatureSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        // Forcer le statut de la candidature à "Demande réçue" qui correspond à 1
        data.STATUT_CANDIDATURE = 1;
        
        const personnesContact = JSON.parse(req.body.PERSONNES_CONTACT || "[]");

        if (personnesContact.length === 0) {
            return res.status(400).json({
                message: "Veuillez ajouter au moins une personne de contact.",
                httpStatus: 400
            });
        }

        // 🔍 Extraire les documents du body
        const documents = [];
        Object.keys(req.body).forEach((key) => {
            const match = key.match(/^documents\[(\d+)]\[(\w+)]$/);
            if (match) {
                const [_, index, field] = match;
                documents[index] = documents[index] || {};
                documents[index][field] = req.body[key];
            }
        });

        // 📎 Associer chaque fichier uploadé à son document
        for (const name in files) {
            const match = name.match(/^documents\[(\d+)]\[IMAGE\]$/);
            if (match) {
                const index = match[1];
                const uploadedFile = await Uploader.save(files[name], 'documents');
                const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
                const filePath = `${baseUrl}/${uploadedFile?.fileInfo?.fileName}`;

                if (documents[index]) {
                    documents[index].PATH_DOCUMENT = filePath;
                }
            }
        }

        // ✅ Vérifier si on a au moins 50% des documents requis
        const totalRequiredDocs = await TypeDocument.count();
        const validDocs = documents.filter(doc => doc.TYPE_DOCUMENT_ID && doc.PATH_DOCUMENT);
        if (validDocs.length < Math.ceil(totalRequiredDocs * 0.5)) {
            return res.status(400).json({
                message: "Veuillez fournir au moins 50% des documents exigés.",
                httpStatus: 400
            });
        }
        // return console.log('donnees recues :', req.body)
        // Sauvegarde de la candidature
        const candidature = await Candidature.create(data, { transaction });

        // Sauvegarde les documents liés à la candidature
        for (const doc of validDocs) {
            await Document.create({
                TYPE_DOCUMENT_ID: doc.TYPE_DOCUMENT_ID,
                PATH_DOCUMENT: doc.PATH_DOCUMENT,
                CANDIDATURE_ID: candidature.ID_CANDIDATURE
            }, { transaction });
        }

        // Ajout des personnes de contact
        for (const p of personnesContact) {
            await PersonneContact.create({
                ...p,
                CANDIDATURE_ID: candidature.ID_CANDIDATURE
            }, { transaction });
        }

        // Commit
        await transaction.commit();

        // Envoi d'email de confirmation
        await emailSender(
            { to: data.EMAIL_PRIVE, subject: "Confirmation d'envoi de la candidature" },
            "confirmation_candidature",
            {
                candidat: `${data.NOM} ${data.PRENOM}`,
                // annee: data.ANNEE_ACADEMIQUE
            }
        );

        res.status(201).json({
            httpStatus: 201,
            message: "Candidature envoyée avec succès",
            data: candidature
        });

    } catch (error) {
        await transaction.rollback();

        if (error instanceof yup.ValidationError) {
            return res.status(422).json({
                httpStatus: 422,
                message: "Erreur de validation",
                errors: error.inner.reduce((acc, curr) => {
                    if (curr.path) acc[curr.path] = curr.message;
                    return acc;
                }, {})
            });
        }

        console.error(error);

        res.status(500).json({
            message: "Erreur interne du serveur",
            httpStatus: 500
        });
    }
};


/**
 * Trouver une seule candidature
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getCandidature = async (req, res) => {
    try {
        const { ID_CANDIDATURE } = req.params
        const candidature = await Candidature.findByPk(ID_CANDIDATURE, {
            include: [ 
                { model: Utilisateur, as: 'candidat' }, 
                { model: Classe, as: 'classe', include: [{ model: Departement, as: 'departement', include: [{ model: Faculte, as: 'faculte' }] }] },
                { model: Sexe, as: 'sexe' },
                { model: Nationalite, as: 'nationalite' },
                { model: EtatCivil, as: 'etat_civil' },
                { model: Utilisateur, as: 'secretaire' },
                { model: Document, as: 'documents', include: [{ model: TypeDocument, as: 'type_document' }] },
                { model: PersonneContact, as: 'personnes_contact' },
                { model: MotifRejet, as: 'motif_rejets', include: [{ model: Motif, as: 'motif' }] }
            ]
        });

        if (!candidature) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Candidature non trouvé',
                data: candidature
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Candidature trouvé avec succès',
            data: candidature
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: null
        })
    }
}

const getCandidatureParUtilisateur = async (req, res) => {
    try {
        const { utilisateurId } = req.params;

        const demandes = await Candidature.findAll({
            where: { CANDIDAT_ID: utilisateurId },
            include: [
                { model: Classe, as: 'classe', include: [{ model: Departement, as: 'departement', include: [{ model: Faculte, as: 'faculte' }] }] },
                { model: Sexe, as: 'sexe' },
                { model: Nationalite, as: 'nationalite' },
                { model: EtatCivil, as: 'etat_civil' },
                { model: Document, as: 'documents', include: [{ model: TypeDocument, as: 'type_document' }] },
                { model: PersonneContact, as: 'personnes_contact' }
            ]
        })

        res.json({
            httpStatus: 200,
            message: 'Candidatures trouvés avec succès',
            data: demandes
        });
    } catch (error) {
        
    }
}

/**
 * Refuser une candidature
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const refuserCandidature = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { MOTIF_ID, SECRETAIRE_ID } = req.body;

        if (!Array.isArray(MOTIF_ID) || MOTIF_ID.length === 0) {
            return res.status(400).json({
                message: "Veuillez fournir au moins un motif de rejet.",
                httpStatus: 400,
            });
        }

        const candidature = await Candidature.findByPk(id);

        if(!candidature) {
            return res.json({
                httpStatus: 404,
                message: 'Candidature non trouvée',
                data
            });
        }

        candidature.STATUT_CANDIDATURE = 5;
        candidature.SECRETAIRE_ID = SECRETAIRE_ID

        // return console.log(req.body)
        await candidature.save({ transaction });
        
        const motifsRejets = MOTIF_ID.map(motifId => ({
            CANDIDATURE_ID: id,
            MOTIF_ID: motifId
        }));
        await MotifRejet.bulkCreate(motifsRejets, {transaction})
        
        const motifs = await Motif.findAll({
            where: { ID_MOTIF: MOTIF_ID },
            transaction
        });

        const motifDescriptions = motifs.map(m => `- ${m.DESCRIPTION}`).join('\n');

        await transaction.commit();

        // Envoi d'email de refus
        try {
            await emailSender(
                { to: candidature.EMAIL_PRIVE, subject: "Rejet de votre demande d'inscription" },
                "refus_candidature",
                {
                    candidat: `${candidature.NOM} ${candidature.PRENOM}`,
                    motif: motifDescriptions
                }
            );
        } catch (error) {
            res.status(404).json({
            message: 'Erreur envoie email',
            httpStatus: 404,
            data: null
        })
        }
        
        res.status(201).json({
            httpStatus: 201,
            message: "Refus avec succès",
            data: candidature
        });

    } catch (error) {
        // rollback ne sera exécuté que si la transaction n'est pas déjà terminée
        if (!transaction.finished) {
            await transaction.rollback();
        }
        

        console.error(error);

        res.status(500).json({
            message: "Erreur interne du serveur",
            httpStatus: 500
        });
    }
}

/**
 * Approuver une candidature
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const approuverCandidature = async (req, res) => {
    try {
        const { id } = req.params;
        const { SECRETAIRE_ID } = req.body;

        const candidature = await Candidature.findByPk(id);

        if (!candidature) {
            return res.status(404).json({
                message: 'Candidature non trouvée',
                httpStatus: 404
            });
        }

        candidature.STATUT_CANDIDATURE = 3; // en attente de paiement
        candidature.SECRETAIRE_ID = SECRETAIRE_ID;
        await candidature.save();

        // Email
        await emailSender(
            { to: candidature.EMAIL_PRIVE, subject: "Paiement de votre demande d'inscription" },
            "paiement_candidature",
            {
                candidat: `${candidature.NOM} ${candidature.PRENOM}`,
                lien_paiement: `http://localhost:8080/afripay-button-payment/${candidature.ID_CANDIDATURE}`
            }
        );

        res.status(200).json({
            httpStatus: 200,
            message: "Envoie avec succès",
            data: candidature
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            httpStatus: 500,
            message: "Erreur interne du serveur"
        });
    }
};

const mettreEnTraitementCandidature = async (req, res) => {
    try {
        const { id } = req.params;

        const candidature = await Candidature.findByPk(id);
        
        if (!candidature) return res.status(404).json({ message: "Candidature introuvable" });

        if (candidature.STATUT_CANDIDATURE === 1) {
            candidature.STATUT_CANDIDATURE = 2;
            await candidature.save();
        }

        res.json({ message: "La candidature est maintenant en cours de traitement." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur du serveur" });
    }
}

/**
 * Recupérer la liste des paiements
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getPaiements = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortDirection = "DESC"

        const sortColumns = {
            paiements: {
                as: "paiement",
                fields: {
                    ID_PAIEMENT: "ID_PAIEMENT",
                    DESCRIPTION: "DESCRIPTION",
                    MONTANT: "MONTANT",
                    TYPE_PAIEMENT_ID: "TYPE_PAIEMENT_ID",
                    DATE_PAIEMENT: "DATE_PAIEMENT",
                    CANDIDATURE_ID: "CANDIDATURE_ID",
                    DATE_INSERTION: "DATE_INSERTION",
                }
            },
        }

        let orderColumn, orderDirection
        // sorting
        let sortModel

        if (sortField) {
            for (let key in sortColumns) {
                if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                    sortModel = {
                        model: key,
                        as: sortColumns[key].as
                    }

                    orderColumn = sortColumns[key].fields[sortField]

                    break
                }
            }
        }

        if (!orderColumn || !sortModel) {
            orderColumn = sortColumns.paiements.fields.ID_PAIEMENT

            sortModel = {
                model: 'paiement',
                as: sortColumns.paiements.as
            }

        }

        // ordering
        if (sortOrder == 1) {
            orderDirection = 'ASC'
        } else if (sortOrder == -1) {
            orderDirection = 'DESC'
        } else {
            orderDirection = defaultSortDirection
        }

        // searching
        const globalSearchColumns = [
            "ID_PAIEMENT",
            "DESCRIPTION",
            "MONTANT",
            "TYPE_PAIEMENT_ID",
            "DATE_PAIEMENT",
            "CANDIDATURE_ID",
            "DATE_INSERTION",
            "$type_paiement.DESCRIPTION$",
            "$candidature.NOM$",
            "$candidature.PRENOM$",
            "$candidature.classe.DESCRIPTION$",
            "$candidature.classe.departement.DESCRIPTION$",
            "$candidature.classe.departement.faculte.DESCRIPTION$",
            "$candidature.nationalite.NOM_NATIONALITE$",
            "$candidature.etat_civil.DESCRIPTION",
            "$candidature.secretaire.NOM$",
            "$candidature.secretaire.PRENOM$",
            "$candidature.sexe.SEXE_DESCRIPTION$"
        ]

        let globalSearchWhereLike = {}

        if (search && search.trim() != "") {
            const searchWildCard = {}

            globalSearchColumns.forEach(column => {
                searchWildCard[column] = {
                    [Op.substring]: search
                }
            })

            globalSearchWhereLike = {
                [Op.or]: searchWildCard
            }
        }

        const data = await Paiement.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[orderColumn, orderDirection]],
            where: { ...globalSearchWhereLike, },
            include: [
                { model: TypePaiement, as: 'type_paiement' }, 
                { model: Candidature, as: 'candidature', include: [
                    { model: Utilisateur, as: 'candidat' }, 
                    { model: Classe, as: 'classe', include: [{ model: Departement, as: 'departement', include: [{ model: Faculte, as: 'faculte' }] }] },
                    { model: Sexe, as: 'sexe' },
                    { model: Nationalite, as: 'nationalite' },
                    { model: EtatCivil, as: 'etat_civil' },
                    { model: Utilisateur, as: 'secretaire' },
                    { model: Document, as: 'documents', include: [{ model: TypeDocument, as: 'type_document' }] },
                    { model: PersonneContact, as: 'personnes_contact' }
                ] }
            ]
        });

        res.json({
            httpStatus: 200,
            message: 'Paiements recupérés avec succès',
            data
        });
    } catch (error) {
        console.error(error);

        res.json({
            // message: 'Erreur interne du serveur',
            message: error.message,
            httpStatus: 500,
            data: null
        })
    }
}


module.exports = {
    getCandidatures,
    createCandidature,
    getCandidature,
    getCandidatureParUtilisateur,
    refuserCandidature,
    approuverCandidature,
    mettreEnTraitementCandidature,
    getPaiements
};
