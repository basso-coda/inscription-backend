const yup = require('yup');
const { ValidationError, Op } = require('sequelize');

const Profil = require('../../db/models/administrations/Profil');
const Role = require('../../db/models/administrations/Role');

yup.setLocale({
    mixed: {
        required: 'Ce champ est obligatoire',
        notType: 'Ce champ est obligatoire'
    }
});

/**
 * Recupérer la liste des profils
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getProfils = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortDirection = "DESC"

        const sortColumns = {
            utilisateurs: {
                as: "profil",
                fields: {
                    ID_PROFIL: "ID_PROFIL",
                    DESCRIPTION: "DESCRIPTION"
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
            orderColumn = sortColumns.utilisateurs.fields.ID_PROFIL

            sortModel = {
                model: 'profil',
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
            "ID_PROFIL",
            "DESCRIPTION",
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

        const data = await Profil.findAndCountAll({
            include: [{ model: Role, as: 'ROLES', through: { attributes: [] } }],
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[orderColumn, orderDirection]],
            where: { ...globalSearchWhereLike, },
        });

        res.status(200).json({
            httpStatus: 200,
            message: 'Profils recupérés avec succès',
            data,

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
 * Créer un profil
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createProfil = async (req, res) => {
    // Géstion d'erreur de toute la méthode
    try {
        const profilSchema = yup.object().shape({
            DESCRIPTION: yup.string().required(),
        });

        const data = await profilSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

        const newData = await Profil.create(data);

        return res.status(201).json({
            httpStatus: 201,
            message: 'Profil crée avec succès',
            data: newData.toJSON()
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

        return res.json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: null
        })
    }
}

/**
 * Trouver un seul profil
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getProfil = async (req, res) => {
    try {
        const profil = await Profil.findByPk(req.params.ID_profil);

        if (!profil) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Profil non trouvé',
                data: profil
            });
        }

        res.status(200).json({
            httpStatus: 200,
            message: 'Profils trouvé avec succès',
            data: profil
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
 * Modifier un profil
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateProfil = async (req, res) => {
    try {
        const profil = await Profil.findByPk(req.params.ID_profil);

        if (!profil) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Profil non trouvé',
                data: profil,
            });
        }

        const updateSchema = yup.lazy(() => yup.object({
            DESCRIPTION: yup.string().optional(),
        }));

        const data = await updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        await Profil.update(data, { where: { ID_PROFIL: req.params.ID_profil } })

        res.status(200).json({
            httpStatus: 200,
            message: 'Profil modifié avec succès',
            data
        });


    } catch (error) {
        console.error(error);

        res.json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: null
        })
    }
}

/**
 * Trouver un seul profil
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteProfil = async (req, res) => {
    try {
        const ID_PROFILS = JSON.parse(req.body.ID_PROFILS);

        const oldProfils = await Profil.findAll({ where: { ID_PROFIL: ID_PROFILS } })

        oldProfils.forEach(async profil => {
            await Profil.update({ IS_DELETED: Number(!profil.IS_DELETED) }, { where: { ID_PROFIL: profil.ID_PROFIL } })
        })

        res.json({
            httpStatus: 200,
            message: 'Profil supprimé avec succès',
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
    getProfils,
    createProfil,
    getProfil,
    updateProfil,
    deleteProfil
};