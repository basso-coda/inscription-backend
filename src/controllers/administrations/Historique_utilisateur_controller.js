const yup = require('yup');
const bcrypt = require('bcrypt');
const { ValidationError, Op } = require('sequelize');
const Uploader = require('../../utils/Upload');

const Utilisateur = require('../../db/models/administrations/Utilisateur');
const Profil = require('../../db/models/administrations/Profil');
const UtilisateurHistorique = require('../../db/models/administrations/Utilisateur_historique');

yup.setLocale({
    mixed: {
        required: 'Ce champ est obligatoire',
        notType: 'Ce champ est obligatoire'
    }
});

/**
 * Recupérer la liste des utilisateurs
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getHistoriqueUtilisateurs = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortDirection = "DESC"

        const sortColumns = {
            utilisateur_historique: {
                as: "utilisateur_historique",
                fields: {
                    ID_UTILISATEUR_HISTORIQUE: "ID_UTILISATEUR_HISTORIQUE",
                    UTILISATEUR_ID: "UTILISATEUR_ID",
                    COMMENTAIRE: "COMMENTAIRE",
                    STATUT_ID: "STATUT_ID",
                    USER_ID: "USER_ID",
                    PROFIL_ID: "PROFIL_ID",
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
            orderColumn = sortColumns.utilisateur_historique.fields.ID_UTILISATEUR_HISTORIQUE

            sortModel = {
                model: 'utilisateur_historique',
                as: sortColumns.utilisateur_historique.as
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
            "ID_UTILISATEUR_HISTORIQUE",
            "UTILISATEUR_ID",
            "COMMENTAIRE",
            "USER_ID",
            "PROFIL_ID",
            "DATE_INSERTION",
            "$utilisateur.NOM$",
            "$utilisateur.PRENOM$",
            "$titulaire.NOM$",
            "$titulaire.PRENOM$",
            "$profil.DESCRIPTION$"
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

        const data = await UtilisateurHistorique.findAndCountAll({
            attributes: { exclude: 'MOT_DE_PASSE' },
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[orderColumn, orderDirection]],
            where: { ...globalSearchWhereLike, },
            include: [
                { model: Utilisateur, as: 'utilisateur', attributes: ['NOM', 'PRENOM'] },
                { model: Utilisateur, as: 'titulaire', attributes: ['NOM', 'PRENOM'] },
                { model: Profil, as: 'profil', attributes: ['DESCRIPTION'] },
            ]
        });

        res.json({
            httpStatus: 200,
            message: 'Historique utilisateurs recupérés avec succès',
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
 * Créer un utilisateur
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createUtilisateur = async (req, res) => {
    let files = {}, data;

    // copier tous les fichiers uploadés
    for (const name in req.files) {
        files[name] = req.files[name]
    }

    // Géstion d'erreur de toute la méthode
    const utilisateurSchema = yup.lazy(() => yup.object({
        NOM: yup.string().required(),
        PRENOM: yup.string().required(),
        USERNAME: yup.string().required(),
        EMAIL: yup.string().email().required(),
        TELEPHONE: yup.string().required(),

        PROFIL_ID: yup.number().required(),

        IMAGE: yup.mixed().test("fileSize", "Le fichier est volumineux", (value) => {
            if (!value?.size) return true // attachment is optional
            return value.size <= 200_000
        }),

    }));

    // Géstion d'erreur de validation des données
    try {
        data = await utilisateurSchema.validate(
            { ...req.body, ...files },
            { abortEarly: false, stripUnknown: true }
        );
    } catch (ex) {
        return res.status(422).json({
            httpStatus: 422,
            message: 'Erreur de validation des données',
            data: null,
            errors: ex.inner.reduce((acc, curr) => {
                if (curr.path) {
                    return { ...acc, [curr.path]: curr.errors[0] }
                }
            }, {}),
        })
    }

    // Géstion d'erreur d'insertion des données
    try {
        const salt = await bcrypt.genSalt(10)
        const MOT_DE_PASSE = await bcrypt.hash(data.MOT_DE_PASSE, salt)

        // stocker les fichiers dans la memoire et recupèrer le chemin
        for (const name in files) {
            const uploadedFile = await Uploader.save(files[name], 'utilisateurs');
            files[name] = `${req.protocol}://${req.get("host")}/${uploadedFile?.fileInfo?.fileName}`
        }

        const newData = await Utilisateur.create({
            ...data,
            ...files,
            MOT_DE_PASSE
        });

        delete newData.dataValues.MOT_DE_PASSE

        res.status(201).json({
            httpStatus: 201,
            message: 'Utilisateur crée avec succès',
            data: newData.dataValues
        });

    } catch (error) {
        console.log(error);
        if (error instanceof ValidationError) {
            return res.status(422).json({
                message: 'Erreur de validation des données',
                httpStatus: 422,
                data: null,
                errors: error?.errors.reduce((acc, curr) => {
                    if (curr.path) {
                        return { ...acc, [curr.path]: curr.message }
                    }
                }, {})
            });
        }

        res.status(500).json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: null
        })
    }
}

/**
 * Trouver un seul utilisateur
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getUtilisateur = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findByPk(req.params.ID_utilisateur, {
            attributes: { exclude: 'MOT_DE_PASSE' },
            include: {
                model: Profil,
                as: 'profil',
            }
        });

        if (!utilisateur) {
            return res.status(404).json({
                httpStatus: 200,
                message: 'Utilisateur non trouvé',
                data: utilisateur
            });
        }

        res.json({
            httpStatus: 200,
            message: 'HistoriqueUtilisateurs trouvé avec succès',
            data: utilisateur
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

/**
 * Modifier un utilisateur
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateUtilisateur = async (req, res) => {
    try {

        const utilisateur = await Utilisateur.findByPk(req.params.ID_utilisateur, { attributes: { exclude: 'MOT_DE_PASSE' } });

        if (!utilisateur) {

            return res.status(404).json({
                httpStatus: 404,
                message: 'Utilisateur non trouvé',
                data: null
            });

        }

        let files = {}, data;

        // copier tous les fichiers uploadés
        for (const name in req.files) {
            files[name] = req.files[name]
        }

        try {
            const updateSchema = yup.lazy(() => yup.object({
                NOM: yup.string().optional(),
                PRENOM: yup.string().optional(),
                USERNAME: yup.string().optional(),
                EMAIL: yup.string().email().optional(),
                NUMERO_TELEPHONE: yup.string().optional(),

                PROFIL_ID: yup.number().optional(),

                IMAGE: yup.mixed().test("fileSize", "Le fichier est volumineux", (value) => {
                    if (!value?.size) return true // attachment is optional
                    return value.size <= 200_000
                }),

            }));

            data = await updateSchema.validate(
                { ...req.body, ...files },
                { abortEarly: false, stripUnknown: true }
            );

        } catch (ex) {
            return res.status(422).json({
                httpStatus: 422,
                message: 'Erreur de validation des données',
                data: null,
                errors: ex.inner.reduce((acc, curr) => {
                    if (curr.path) {
                        return { ...acc, [curr.path]: curr.errors[0] }
                    }
                }, {}),
            })
        }
        // stocker les fichiers dans la memoire et recupèrer le chemin
        for (const name in files) {
            const uploadedFile = await Uploader.save(files[name], 'utilisateurs');
            files[name] = `${req.protocol}://${req.get("host")}/${uploadedFile?.fileInfo?.fileName}`
        }

        await Utilisateur.update({ ...data, ...files, }, {
            where: { ID_UTILISATEUR: req.params.ID_utilisateur },
            returning: true,
        })

        res.json({
            httpStatus: 200,
            message: 'Utilisateur modifié avec succès',
            data: { ...utilisateur.toJSON(), ...data, ...files }
        });


    } catch (error) {
        console.log(error);

        if (error instanceof ValidationError) {
            return res.status(422).json({
                message: 'Erreur de validation des données',
                httpStatus: 422,
                data: null,
                errors: error?.errors.reduce((acc, curr) => {
                    if (curr.path) {
                        return { ...acc, [curr.path]: curr.message }
                    }
                }, {})
            });
        }

        res.status(500).json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: error.message
        })
    }
}

/**
 * Trouver un seul utilisateur
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteUtilisateur = async (req, res) => {
    try {
        let data;

        try {
            const updateSchema = yup.lazy(() => yup.object({
                UTILISATEUR_IDS: yup.string().required(),
                IS_ACTIVE: yup.number().default(0).oneOf([0, 1]),
                COMMENTAIRE: yup.string().required(),
                USER_ID: yup.number().required(),
            }));

            data = await updateSchema.validate(
                { ...req.body },
                { abortEarly: false, stripUnknown: true }
            );

        } catch (ex) {
            return res.status(422).json({
                httpStatus: 422,
                message: 'Erreur de validation des données',
                data: null,
                errors: ex.inner.reduce((acc, curr) => {
                    if (curr.path) {
                        return { ...acc, [curr.path]: curr.errors[0] }
                    }
                }, {}),
            })
        }

        const UTILISATEURS = JSON.parse(data.UTILISATEUR_IDS);

        const users = await Utilisateur.findAll({
            attributes: ['ID_UTILISATEUR', 'PROFIL_ID', 'IS_ACTIVE'],
            where: { ID_UTILISATEUR: UTILISATEURS }
        })

        await Utilisateur.update({ IS_ACTIVE: data.IS_ACTIVE }, { where: { ID_UTILISATEUR: UTILISATEURS } })

        const newUsers = users.map(u => {
            return {
                UTILISATEUR_ID: u.ID_UTILISATEUR,
                PROFIL_ID: u.PROFIL_ID,
                STATUT_ID: u.IS_ACTIVE, // Le statut qu'il avait avant
                COMMENTAIRE: data.COMMENTAIRE,
                USER_ID: data?.USER_ID // L'utilisateur déclenchant l'action
            }
        })

        await UtilisateurHistorique.bulkCreate(newUsers) // Créer l'historique de ceux désactivés

        res.json({
            httpStatus: 200,
            message: `${UTILISATEURS.length} utilisateur(s) supprimé(s) avec succès`,
            data: null
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

module.exports = {
    getHistoriqueUtilisateurs,
    createUtilisateur,
    getUtilisateur,
    updateUtilisateur,
    deleteUtilisateur
};