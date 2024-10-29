const yup = require('yup')
const { ValidationError } = require('sequelize')
const Sexe = require('../../db/models/sexe/Sexe_model')

/**
 * Recupérer la liste des sexes
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getSexes = async (req, res) => {
    try {
        const data = await Sexe.findAndCountAll();

        res.json({
            httpStatus: 200,
            message: 'Sexes recupérés avec succès',
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
    getSexes
}