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
const PersonneContact = require('../../db/models/gestion_etudiant/PersonneContact');
const Etudiant = require('../../db/models/gestion_etudiant/Etudiant');


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
const getEtudiants = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortDirection = "DESC"

        const sortColumns = {
            etudiants: {
                as: "etudiant",
                fields: {
                    ID_ETUDIANT: "ID_ETUDIANT",
                    CANDIDATURE_ID: "CANDIDATURE_ID",
                    NUMERO_MATRICULE: "NUMERO_MATRICULE",
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
            orderColumn = sortColumns.etudiants.fields.ID_ETUDIANT

            sortModel = {
                model: 'etudiant',
                as: sortColumns.etudiants.as
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
            "ID_ETUDIANT",
            "CANDIDATURE_ID",
            "NUMERO_MATRICULE",
            "DATE_INSERTION",
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

        const data = await Etudiant.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[orderColumn, orderDirection]],
            where: { ...globalSearchWhereLike, },
            include: [
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
            message: 'Etudiants recupérés avec succès',
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
    getEtudiants
};