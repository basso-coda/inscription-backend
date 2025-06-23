const yup = require('yup');
const Profil = require('../../db/models/administrations/Profil')
const { ValidationError, Op } = require('sequelize');
const ProfilRole = require('../../db/models/administrations/Profil_role');
const Role = require('../../db/models/administrations/Role');

/**
 * Recupérer la liste des profil roles
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getProfilRoles = async (req, res) => {
    const {search} = req.query;
    try {

        const { rows = 10, first = 0, sortField, sortOrder, search, role} = req.query

        const defaultSortField = "ID_PROFIL_ROLE"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            profil_roles: {
            as: "profil_role",
            fields: {
                ID_PROFIL_ROLE: "profil_role.ID_PROFIL_ROLE",
                PROFIL_ID: "PROFIL_ID",
                ROLE_ID: "ROLE_ID"
            }
          },
        }
        var orderColumn, orderDirection
        // sorting
        var sortModel
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
          orderColumn = sortColumns.profil_roles.fields.ID_PROFIL_ROLE
          sortModel = {
            model: 'profil_role',
            as: sortColumns.profil_roles
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
            '$profil.DESCRIPTION$',
            '$role.DESCRIPTION$'
        ]
        var globalSearchWhereLike = {}
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

        //filtre par role
        var filtrerole={}
        if(role){
            filtrerole= {"$role.ID_ROLE$":role}
        }

        const profil_roles = await ProfilRole.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
                ...filtrerole
            },
            include: [
                {
                    model: Profil,
                    as: 'profil'
                },
                {
                    model: Role,
                    as: 'role'
                }
            ]

        })

        res.status(200).json({
          message: "Liste des roles des profils",
          totalRecords:profil_roles.count,
          profil_roles
        });
    }
    catch (error) {
        console.error(error);
        res.json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: null
        })
    }
}

/**
 * Trouver un profil role
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getProfilRole = async (req, res) => {
    try {
        const profil_role = await ProfilRole.findByPk(req.params.ID_PROFIL_ROLE);

        if (!profil_role) {
            return res.status(404).json({
                httpStatus: 200,
                message: 'Role du profil non trouvé',
                data: profil_role
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Role du profil trouvé avec succès',
            data: profil_role
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


module.exports = {
    getProfilRoles,
    getProfilRole,
}