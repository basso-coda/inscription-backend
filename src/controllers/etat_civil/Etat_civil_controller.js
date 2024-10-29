const yup = require('yup')
const { ValidationError } = require('sequelize')
const EtatCivil = require('../../db/models/etat_civil/Etat_civil_model')

/**
 * Recupérer la liste des etat civils
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getEtatCivils = async (req, res) => {
    try {
        const data = await EtatCivil.findAndCountAll();

        res.json({
            httpStatus: 200,
            message: 'Etat civils recupérés avec succès',
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
    getEtatCivils
}