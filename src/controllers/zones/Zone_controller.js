const yup = require('yup')
const { ValidationError } = require('sequelize')
const Zone = require('../../db/models/zones/Zone_model');
const Commune = require('../../db/models/communes/Commune_model');

/**
 * Recupérer la liste des zones
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getZones = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search, commune} = req.query
    
        const defaultSortField = "ZONE_ID"
        const defaultSortDirection = "DESC"
        const sortColumns = {
          zones: {
            as: "zones",
            fields: {
                ZONE_ID: "zones.ZONE_ID",
                ZONE_NAME: "ZONE_NAME",
                COMMUNE_ID: "COMMUNE_ID",
                LATITUDE: "LATITUDE",
                LONGITUDE: "LONGITUDE"
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
          orderColumn = sortColumns.zones.fields.ZONE_ID
          sortModel = {
            model: 'zones',
            as: sortColumns.zones
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
          'ZONE_NAME',
          'COMMUNE_ID',
          'LATITUDE',
          'LONGITUDE',
          '$communes.COMMUNE_NAME$',
    
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
        var filtrecommune={}
        if(commune){
            filtrecommune= {"$communes.COMMUNE_ID$":commune}
        }

        const zones = await Zone.findAndCountAll({
          limit: parseInt(rows),
          offset: parseInt(first),
          order: [
            [sortModel, orderColumn, orderDirection]
          ],
          where: {
            ...globalSearchWhereLike,
            ...filtrecommune
          },
          include: [
            {
              model: Commune,
              as: 'communes'
            }
          ]
          
        })
    
        res.status(200).json({
          message: "Liste des zones",
          totalRecords:zones.count,
          zones
        })
      } catch (error) {
        console.log(error)
        res.status(500).json({
          message: "Erreur interne du serveur, réessayer plus tard"
        })
      }
}

module.exports = {
    getZones
}