const yup = require('yup')
const { ValidationError } = require('sequelize')
const Commune = require('../../db/models/communes/Commune_model');
const Province = require('../../db/models/provinces/Province_model');

/**
 * Recupérer la liste des communes
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getCommunes = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search, province} = req.query
    
        const defaultSortField = "COMMUNE_ID"
        const defaultSortDirection = "DESC"
        const sortColumns = {
          communes: {
            as: "communes",
            fields: {
                COMMUNE_ID: "communes.COMMUNE_ID",
                COMMUNE_NAME: "COMMUNE_NAME",
                PROVINCE_ID: "PROVINCE_ID",
                COMMUNE_LATITUDE: "COMMUNE_LATITUDE",
                COMMUNE_LONGITUDE: "COMMUNE_LONGITUDE"
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
          orderColumn = sortColumns.communes.fields.COMMUNE_ID
          sortModel = {
            model: 'communes',
            as: sortColumns.communes
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
          'COMMUNE_NAME',
          'PROVINCE_ID',
          'COMMUNE_LATITUDE',
          'COMMUNE_LONGITUDE',
          '$provinces.PROVINCE_NAME$',
    
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

        //filtre par type_partenaire
        var filtreprovince={}
        if(province){
            filtreprovince= {"$provinces.PROVINCE_ID$":province}
        }

        const communes = await Commune.findAndCountAll({
          limit: parseInt(rows),
          offset: parseInt(first),
          order: [
            [sortModel, orderColumn, orderDirection]
          ],
          where: {
            ...globalSearchWhereLike,
            ...filtreprovince
          },
          include: [
            {
                model: Province,
                as: 'provinces',
            }
          ]
          
        })
    
        res.status(200).json({
          message: "Liste des communes",
          totalRecords:communes.count,
          communes
        })
      } catch (error) {
        console.log(error)
        res.status(500).json({
          message: "Erreur interne du serveur, réessayer plus tard"
        })
      }
}

module.exports = {
    getCommunes
}