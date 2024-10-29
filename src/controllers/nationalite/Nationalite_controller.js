const yup = require('yup')
const { ValidationError, Op } = require('sequelize');
const Nationalite = require('../../db/models/nationalite/Nationalite');

/**
 * Recupérer la liste des provinces
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getNationalites = async (req, res) => {
    try {
        const data = await Nationalite.findAndCountAll(
            // where: {
            //     NOM_NATIONALITE: {
            //         [Op.ne]: 'Burundi'  // Exclut le pays dont le nom est 'Burundi'
            //     }
            // }
        );

        res.json({
            httpStatus: 200,
            message: 'Nationalites recupérés avec succès',
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

module.exports = {
    getNationalites
}