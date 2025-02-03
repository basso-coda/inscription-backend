const yup = require('yup');
const Exigence = require('../../db/models/gestion_facultes/Exigence')
const { ValidationError, Op } = require('sequelize');
const ExigenceFaculte = require('../../db/models/gestion_facultes/ExigenceFaculte');

/**
 * Recupérer la liste des éxigences
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getExigences = async (req, res) => {
    const {search} = req.query;
    try {

            // Recherche globale
        let globalSearchColumns = [];

        let searchConditions = [];
        if (search && search.trim() !== "") {
            globalSearchColumns = [
            "DESCRIPTION"];
            globalSearchColumns.forEach(column => {
            searchConditions.push({ [column]: { [Op.substring]: search } });
            });
        }
        // console.log("=======",searchConditions);
        const whereCondition = searchConditions.length > 0 ? { [Op.or]: searchConditions } : {};

            const data = await Exigence.findAndCountAll(
                {
                    where: whereCondition
                }
            );

            res.json({
                httpStatus: 200,
                message: 'Les exigences recupérés avec succès',
                data
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
 * Créer un nouveau éxigence
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createExigence = async (req, res) => {
    //Gestion d'erreur de toute la modele
    try {

        const { FACULTE_ID } = req.body

        const existingExigence = await Exigence.findOne({ where: {DESCRIPTION: req.body.DESCRIPTION} })

        if (existingExigence) {
            return res.status(422).json({
                message: "L'exigence existe deja",
                data: { DESCRIPTION: "L'exigence existe deja dans la BDD" }
            })
        }

        const registerSchema = yup.lazy(() => yup.object({
            DESCRIPTION: yup.string().required()
        }));

        try {
            await registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true })
        } catch (ex) {
            return res.status(422).json({
                httpStatus: 422,
                message: 'Erreur de validation des données',
                data: null,
                errors: ex.inner.reduce((acc, curr) => {
                    if (curr.path) {
                        return { ...acc, [curr.path]: curr.errors[0] }
                    }
                }, {}),
            })
        }

        try {
            const data = await Exigence.create(req.body);

            // Inserer dans exigence faculte
            await ExigenceFaculte.create({
                EXIGENCE_ID : data.ID_EXIGENCE,
                FACULTE_ID
            })

            res.json({
                httpStatus: 200,
                message: 'Exigence créé avec succès',
                data: data.toJSON()
            });

        } catch (error) {

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
            res.status(500).json({
                message: 'Erreur interne du serveur',
                httpStatus: 500,
                data: null,
            });
        }
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
 * Trouver une exigence
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getExigence = async (req, res) => {
    try {
        const exigence = await Exigence.findByPk(req.params.ID_EXIGENCE);

        if (!exigence) {
            return res.status(404).json({
                httpStatus: 200,
                message: 'Exigence non trouvé',
                data: exigence
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Exigence trouvé avec succès',
            data: exigence
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
 * Supprimer le(s) exigence(s)
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteExigence = async (req, res) => {
    try {
        const EXIGENCES = JSON.parse(req.body.IDS_EXIGENCE);

        const exigences = await Exigence.findAll({
            where: { ID_EXIGENCE: EXIGENCES },
            attributes: ['ID_EXIGENCE']
        });

        if (!facultes) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Exigence non trouvé',
                data: null
            });
        }

        const deleted = await Exigence.destroy({ where: { ID_EXIGENCE: EXIGENCES } })

        res.json({
            httpStatus: 200,
            message: 'Exigence supprimé avec succès',
            data: deleted
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
    getExigences,
    createExigence,
    getExigence,
    deleteExigence
}
