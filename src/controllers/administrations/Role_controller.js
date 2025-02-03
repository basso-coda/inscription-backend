const yup = require('yup');
const { ValidationError, Op } = require('sequelize');
const Role = require('../../db/models/administrations/Role');
const ProfilRole = require('../../db/models/administrations/Profil_role');
const Profil = require('../../db/models/administrations/Profil');

/**
 * Recupérer la liste des roles
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getRoles = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search, ID_PROFIL } = req.query

        const defaultSortDirection = "DESC"

        const sortColumns = {
            roles: {
                as: "role",
                fields: {
                    ID_ROLE: "ID_ROLE",
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
            orderColumn = sortColumns.roles.fields.ID_ROLE

            sortModel = {
                model: 'role',
                as: sortColumns.roles.as
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
            "ID_ROLE",
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

        let profilFilter = {};

        if (ID_PROFIL) {
            profilFilter = { ID_PROFIL }
        }

        const data = await Role.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [[orderColumn, orderDirection]],
            where: { ...globalSearchWhereLike, },
            include: [{
                model: Profil,
                where: { ...profilFilter },
                as: 'ROLES',
                attributes: []
            }]
        });

        res.json({
            httpStatus: 200,
            message: 'Roles recupérés avec succès',
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
 * Créer un role
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createRole = async (req, res) => {
    try {
        const registerSchema = yup.lazy(() => yup.object({
            DESCRIPTION: yup.string().required(),
            PROFILS: yup.array(),
        }));

        let data = await registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
// return console.log(data);

        const newData = await Role.create(data);
        const profilRoles = req.body?.PROFILS?.map(p => ({ PROFIL_ID: p.ID_PROFIL, ROLE_ID: newData.dataValues.ID_ROLE })) ?? [];

        ProfilRole.bulkCreate(profilRoles);

        res.status(201).json({
            httpStatus: 201,
            message: 'Role crée avec succès',
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
                    return acc;
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

        return res.status(500).json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: null
        })
    }
}

/**
 * Trouver un seul role
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.ID_role);

        if (!role) {
            return res.status(404).json({
                httpStatus: 400,
                message: 'Role non trouvé',
                data: role
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Role trouvé avec succès',
            data: role
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
 * Modifier un role
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.ID_role);
        let data;

        if (!role) {
            return res.json({
                httpStatus: 404,
                message: 'Role non trouvé',
                data
            });
        }

        const updateSchema = yup.lazy(() => yup.object({
            DESCRIPTION: yup.string().optional(),
            PROFILS: yup.array(),
        }));

        data = await updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        await Role.update({ DESCRIPTION: data.DESCRIPTION }, { where: { ID_ROLE: req.params.ID_role } })

        // on supprime tous si rien n'est selectionné
        if (data?.PROFILS?.length === 0) {
            await ProfilRole.destroy({ where: { ROLE_ID: req.params.ID_role } })
        }

        data?.PROFILS?.forEach(async profil => {
            const profilRole = await ProfilRole.findOne(
                {
                    where: [
                        { ROLE_ID: req.params.ID_role },
                        { PROFIL_ID: profil.ID_PROFIL }
                    ]
                }
            );

            /**
             * on se rassure d'inserer seulement les nouveaux profils
             * sélectionnés qui n'existent pas avant
             */

            if (!profilRole) {
                await ProfilRole.create({
                    ROLE_ID: req.params.ID_role,
                    PROFIL_ID: profil.ID_PROFIL
                })
            }
        })

        res.json({
            httpStatus: 200,
            message: 'Role modifié avec succès',
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
 * Trouver un seul role
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteRole = async (req, res) => {
    try {
        const ID_ROLES = JSON.parse(req.body.ID_ROLES);

        const oldRoles = await Role.findAll({ where: { ID_ROLE: ID_ROLES } })

        oldRoles.forEach(async role => {
            await Role.update({ IS_DELETED: Number(!role.IS_DELETED) }, { where: { ID_ROLE: role.ID_ROLE } })
        })

        res.json({
            httpStatus: 200,
            message: 'Role supprimé avec succès',
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
    getRoles,
    createRole,
    getRole,
    updateRole,
    deleteRole
};