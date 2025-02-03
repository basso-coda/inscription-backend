const yup = require('yup');
const Exigence = require('../../db/models/gestion_facultes/Exigence')
const { ValidationError, Op } = require('sequelize');
const ExigenceFaculte = require('../../db/models/gestion_facultes/ExigenceFaculte');
const Faculte = require('../../db/models/gestion_facultes/Faculte');

/**
 * Recupérer la liste des éxigences facultés
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getExigenceFacultes = async (req, res) => {
    const {search} = req.query;
    try {

        const { rows = 10, first = 0, sortField, sortOrder, search, faculte} = req.query

        const defaultSortField = "ID_EXIGENCE_FACULTE"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            exigence_facultes: {
            as: "exigence_faculte",
            fields: {
                ID_EXIGENCE_FACULTE: "exigence_faculte.ID_EXIGENCE_FACULTE",
                EXIGENCE_ID: "EXIGENCE_ID",
                FACULTE_ID: "FACULTE_ID"
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
          orderColumn = sortColumns.exigence_facultes.fields.ID_EXIGENCE_FACULTE
          sortModel = {
            model: 'exigence_faculte',
            as: sortColumns.exigence_facultes
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
            '$exigence.DESCRIPTION$',
            '$faculte.DESCRIPTION$'
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

        //filtre par faculte
        var filtrefaculte={}
        if(faculte){
            filtrefaculte= {"$faculte.ID_FACULTE$":faculte}
        }

        const exigence_facultes = await ExigenceFaculte.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
                ...filtrefaculte
            },
            include: [
                {
                    model: Exigence,
                    as: 'exigence'
                },
                {
                    model: Faculte,
                    as: 'faculte'
                }
            ]

        })

        res.status(200).json({
          message: "Liste des exigences facultés",
          totalRecords:exigence_facultes.count,
          exigence_facultes
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
 * Trouver une exigence de faculte
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getExigenceFaculte = async (req, res) => {
    try {
        const exigence_faculte = await ExigenceFaculte.findByPk(req.params.ID_EXIGENCE_FACULTE);

        if (!exigence_faculte) {
            return res.status(404).json({
                httpStatus: 200,
                message: 'Exigence de faculté non trouvé',
                data: exigence_faculte
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Exigence de faculté trouvé avec succès',
            data: exigence_faculte
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
 * Modifier un éxigence faculte
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateExigenceFaculte = async (req, res) => {
    try {
        const existingExigence = await ExigenceFaculte.findByPk(req.params.ID_EXIGENCE_FACULTE);

        if (!existingExigence) {
            return res.json({
                httpStatus: 404,
                message: 'Exigence non trouvé',
                data
            });
        }

        const { EXIGENCE_ID, FACULTE_ID } = req.body

        const updated = await ExigenceFaculte.update(
            { EXIGENCE_ID, FACULTE_ID }, 
            { where: { ID_EXIGENCE: req.params.ID_EXIGENCE_FACULTE } }
        )

        res.json({
            httpStatus: 200,
            message: 'Exigence de faculté modifié avec succès',
            data: updated
        })
    } catch (error) {
        console.log(error);

        res.json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: null
        })
    }
}

module.exports = {
    getExigenceFacultes,
    getExigenceFaculte,
    updateExigenceFaculte
}