const yup = require('yup')
const { ValidationError } = require('sequelize')
const Province = require('../../db/models/provinces/Province_model')

/**
 * Recupérer la liste des provinces
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getProvinces = async (req, res) => {
    try {
        const data = await Province.findAndCountAll();

        res.json({
            httpStatus: 200,
            message: 'Provinces recupérés avec succès',
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
    getProvinces
}