const yup = require('yup')
const { ValidationError } = require('sequelize')
const Colline = require('../../db/models/collines/Colline_model');
const Zone = require('../../db/models/zones/Zone_model');

/**
 * Recupérer la liste des collines
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getCollines = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search, zone} = req.query

        const defaultSortField = "COLLINE_ID"
        const defaultSortDirection = "DESC"
        const sortColumns = {
          collines: {
            as: "collines",
            fields: {
                COLLINE_ID: "COLLINE_ID",
                COLLINE_NAME: "COLLINE_NAME",
                ZONE_ID: "ZONE_ID",
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
          orderColumn = sortColumns.collines.fields.COLLINE_ID
          sortModel = {
            model: 'collines',
            as: sortColumns.collines
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
          'COLLINE_NAME',
          'ZONE_ID',
          'LATITUDE',
          'LONGITUDE',
          '$zones.ZONE_NAME$',

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
        var filtrezone={}
        if(zone){
            filtrezone= {"$zones.ZONE_ID$":zone}
        }

        const collines = await Colline.findAndCountAll({
          limit: parseInt(rows),
          offset: parseInt(first),
          order: [
            [sortModel, orderColumn, orderDirection]
          ],
          where: {
            ...globalSearchWhereLike,
            ...filtrezone
          },
          include:
            {
              model: Zone,
              as: 'zones',
            }


        })

        res.status(200).json({
          message: "Liste des collines",
          totalRecords:collines.count,
          collines
        })
      } catch (error) {
        console.log(error)
        res.status(500).json({
          message: "Erreur interne du serveur, réessayer plus tard"
        })
      }
}


// const getCollines = async (req, res) => {
//   try {
//       const { rows = 10, first = 0, sortField, sortOrder, search } = req.query;

//       const { ZONE_ID } = req.params

//       // Définir l'ordre de tri
//       let order = [];
//       if (sortField) {
//           order = [[sortField, sortOrder === '1' ? 'ASC' : 'DESC']];
//       }

//       // Recherche globale
//       const globalSearchColumns = ["COLLINE_NAME"];
//       let searchConditions = [];
//       if (search && search.trim() !== "") {
//           globalSearchColumns.forEach(column => {
//               searchConditions.push({ [column]: { [Op.substring]: search } });
//           });
//       }

//       const whereCondition = searchConditions.length > 0 ? { [Op.or]: searchConditions } : {};

//       // Requête Sequelize
//       const { count, rows: collines } = await Colline.findAndCountAll({
//           attributes: [
//               "COLLINE_ID",
//               "COLLINE_NAME",
//               "ZONE_ID",
//               "LATITUDE",
//               "LONGITUDE",
//           ],
//           include: [
//               {
//                   model: Zone,
//                   as: "zones",
//                   attributes: [ "ZONE_ID",
//                       "ZONE_NAME",
//                       "COMMUNE_ID",
//                       "LATITUDE",
//                       "LONGITUDE",],
//               }
//           ],
//           where: {
//               ...whereCondition,
//               ZONE_ID

//           },
//           order,
//           limit: parseInt(rows, 10),
//           offset: parseInt(first, 10)
//       });

//       res.status(200).json({
//           message: "Visualisation faite avec succès",
//           collines,
//           totalRecords: count
//       });
//   } catch (error) {
//       console.error(error); // Utiliser `console.error` pour les erreurs
//       res.status(500).send("Erreur interne");
//   }
// };

module.exports = {
    getCollines
}