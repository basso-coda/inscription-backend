const yup = require('yup');
const bcrypt = require('bcrypt');
const { ValidationError, Op } = require('sequelize');
const Uploader = require('../../utils/Upload');

const Utilisateur = require('../../db/models/administrations/Utilisateur');
const Profil = require('../../db/models/administrations/Profil');
const UtilisateurHistorique = require('../../db/models/administrations/Utilisateur_historique');
const Sexe = require('../../db/models/sexe/Sexe_model')
const passwordGenerator = require('../../utils/passwordGenerator');

const emailSender = require('../../utils/emailSender');
const Role = require('../../db/models/administrations/Role');

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
const getUtilisateurs = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search, IS_ACTIVE } = req.query

        const defaultSortDirection = "DESC"

        const sortColumns = {
            utilisateurs: {
                as: "utilisateur",
                fields: {
                    ID_UTILISATEUR: "ID_UTILISATEUR",
                    USERNAME: "USERNAME",
                    NOM: "NOM",
                    PRENOM: "PRENOM",
                    TELEPHONE: "TELEPHONE",
                    EMAIL: "EMAIL",
                    PROFIL_ID: "PROFIL_ID",
                    SEXE_ID: "SEXE_ID",
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
            orderColumn = sortColumns.utilisateurs.fields.ID_UTILISATEUR

            sortModel = {
                model: 'utilisateur',
                as: sortColumns.utilisateurs.as
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
            "ID_UTILISATEUR",
            "USERNAME",
            "NOM",
            "PRENOM",
            "TELEPHONE",
            "EMAIL",
            "PROFIL_ID",
            "SEXE_ID",
            "DATE_INSERTION",
            "$profil.DESCRIPTION$",
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

        if (IS_ACTIVE) {
            globalSearchWhereLike[Op.and] = { IS_ACTIVE }
        }

        const data = await Utilisateur.findAndCountAll({
            attributes: { exclude: 'MOT_DE_PASSE' },
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[orderColumn, orderDirection]],
            where: { ...globalSearchWhereLike, },
            include: [{ model: Profil, as: 'profil', include: [{ model: Role, as: 'ROLES', through: { attributes: [] } }], }, { model: Sexe, as: 'sexe' }]
        });

        res.json({
            httpStatus: 200,
            message: 'Utilisateurs recupérés avec succès',
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
    let files = {};

    // copier tous les fichiers uploadés
    for (const name in req.files) {
        files[name] = req.files[name]
    }

    // Géstion d'erreur de toute la méthode
    const utilisateurSchema = yup.lazy(() => yup.object({
        NOM: yup.string().required(),
        PRENOM: yup.string().required(),
        USERNAME: yup.string().required().when({
            is: val => val.length > 0,
            then: () => yup.string().matches(/^[0-9A-Za-z]{6,16}$/, 'Les caractères spéciaux ou les éspaces ne sont pas permis, et la longueur doit être entre 6 et 16 caractères'),
        }),
        EMAIL: yup.string().email().required(),
        TELEPHONE: yup.string().required(),

        PROFIL_ID: yup.number().required(),
        SEXE_ID: yup.number().required(),

        IMAGE: yup.mixed().test("fileSize", "Le fichier est volumineux", (value) => {
            if (!value?.size) return true // attachment is optional
            return value.size <= 200_000
        }),

    }));

    // Géstion d'erreur de validation des données

    let data = await utilisateurSchema.validate(
        { ...req.body, ...files },
        { abortEarly: false, stripUnknown: true }
    );

    // Géstion d'erreur d'insertion des données
    try {
        const salt = await bcrypt.genSalt(10)
        const randomPassword = passwordGenerator();
        const MOT_DE_PASSE = await bcrypt.hash(randomPassword, salt)

        // stocker les fichiers dans la memoire et recuperer le chemin
        for (const name in files) {
            const uploadedFile = await Uploader.save(files[name], 'utilisateurs');
            files[name] = `${req.protocol}://${req.get("host")}/${uploadedFile?.fileInfo?.fileName}`
        }
        // return console.log('Ivyo ngira mbike', data);
        
        const newData = await Utilisateur.create({
            ...data,
            ...files,
            MOT_DE_PASSE
        });

        // delete newData.dataValues.MOT_DE_PASSE

        // envoie l'email
        await emailSender(
            { to: data.EMAIL, subject: "Création d'un compte", },
            'creation_compte',
            {
                utilisateur: `${data.NOM} ${data.PRENOM}`,
                email: data.EMAIL,
                password: randomPassword,
                lien: `${req.protocol}://${req.get("host")}`
            }
        );

        res.status(201).json({
            httpStatus: 201,
            message: 'Utilisateur crée avec succès',
            data: newData.dataValues
        });

    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return res.status(422).json({
                httpStatus: 422,
                message: 'Erreur de validation des données',
                data: null,
                errors: error.inner.reduce((acc, curr) => {
                    if (curr.path) {
                        return { ...acc, [curr.path]: curr.errors[0] }
                    }
                }, {}),
            })
        }

        console.log(error)

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
        const { ID_utilisateur } = req.params
        const utilisateur = await Utilisateur.findByPk(ID_utilisateur, {
            attributes: { exclude: 'MOT_DE_PASSE' },
            include: [ 
                {
                    model: Sexe,
                    as: 'sexe',
                    attributes: ['SEXE_ID', 'SEXE_DESCRIPTION']
                },
                {
                    model: Profil,
                    as: 'profil',
                    include: [{ model: Role, as: 'ROLES', through: { attributes: [] } }],
                }
            ]
        });

        if (!utilisateur) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Utilisateur non trouvé',
                data: utilisateur
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Utilisateurs trouvé avec succès',
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
                TELEPHONE: yup.string().optional(),

                PROFIL_ID: yup.number().optional(),
                SEXE_ID: yup.number().optional(),

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
        const updateSchema = yup.lazy(() => yup.object({
            ID_UTILISATEUR: yup.number().required(),
            ID_PROFIL: yup.number().required(),
            IS_ACTIVE: yup.number().oneOf([0, 1]),
            COMMENTAIRE: yup.string().required(),
        }));

        let data = await updateSchema.validate(
            { ...req.body },
            { abortEarly: false, stripUnknown: true }
        );

        await Utilisateur.update({ IS_ACTIVE: !data.IS_ACTIVE }, { where: { ID_UTILISATEUR: data.ID_UTILISATEUR } })

        await UtilisateurHistorique.create({
            UTILISATEUR_ID: data.ID_UTILISATEUR,
            PROFIL_ID: data.ID_PROFIL,
            STATUT_ID: data.IS_ACTIVE, // Le statut qu'il avait avant
            COMMENTAIRE: data.COMMENTAIRE,
            USER_ID: req.user?.ID_UTILISATEUR // L'utilisateur déclenchant l'action
        })

        res.json({
            httpStatus: 200,
            message: `Utilisateur ${data.IS_ACTIVE ? 'désactivé' : 'activé'} avec succès`,
            data: null
        });
    } catch (error) {
        console.error(error);

        if (error instanceof yup.ValidationError) {
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

        res.status(500).json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: null
        })
    }
}

module.exports = {
    getUtilisateurs,
    createUtilisateur,
    getUtilisateur,
    updateUtilisateur,
    deleteUtilisateur
};