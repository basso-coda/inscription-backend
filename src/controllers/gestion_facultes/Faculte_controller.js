const yup = require('yup');
const Faculte = require('../../db/models/gestion_facultes/Faculte')
const { ValidationError, Op } = require('sequelize')
const sequelize = require('../../db/models/index').sequelize;

/**
 * Recupérer la liste des facultés
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getFacultes = async (req, res) => {
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

            const data = await Faculte.findAndCountAll(
                {
                    where: whereCondition,
                    attributes: {
                        include: [
                            [sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM exigence_faculte
                                WHERE exigence_faculte.FACULTE_ID = faculte.ID_FACULTE
                            )`), 'nombreExigences'],
                        ],
                    }
                },
            );

            res.json({
                httpStatus: 200,
                message: 'Les facultés recupérés avec succès',
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
 * Créer un nouveau faculté
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createFaculte = async (req, res) => {
    //Gestion d'erreur de toute la modele
    try {

        const existingFaculte = await Faculte.findOne({ where: {DESCRIPTION: req.body.DESCRIPTION} })

        if (existingFaculte) {
            return res.status(422).json({
                message: "La faculté existe deja",
                data: { DESCRIPTION: "Le faculté existe deja dans la BDD" }
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
            const data = await Faculte.create(req.body);

            res.json({
                httpStatus: 200,
                message: 'Faculté créé avec succès',
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
 * Modifier un faculté
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateFaculte = async (req, res) => {
    try {
        const existingFaculte = await Faculte.findByPk(req.params.ID_FACULTE);

        if (!existingFaculte) {
            return res.json({
                httpStatus: 404,
                message: 'Faculté non trouvé',
                data
            });
        }

        // Verifier si le faculté existe deja dans la BDD
        if (req.body.DESCRIPTION !== existingFaculte.DESCRIPTION) {
            const faculteAlreadyExist = await Faculte.findOne({where: {DESCRIPTION: req.body.DESCRIPTION}})
            if (faculteAlreadyExist) {
                return res.status(402).json({
                    message: "La faculté existe deja dans la BDD"
                })
            }
        }

        const updateSchema = yup.lazy(() => yup.object({
            DESCRIPTION: yup.string().optional(),
        }));

        const validatedData = await updateSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
        const updated = await Faculte.update(validatedData, { where: { ID_FACULTE: req.params.ID_FACULTE } })

        res.json({
            httpStatus: 200,
            message: 'Faculté modifié avec succès',
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

/**
 * Trouver un seul type partenaire
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getFaculte = async (req, res) => {
    try {
        const faculte = await Faculte.findByPk(req.params.ID_FACULTE);

        if (!faculte) {
            return res.status(404).json({
                httpStatus: 200,
                message: 'Faculté non trouvé',
                data: faculte
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Faculté trouvé avec succès',
            data: faculte
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
 * Supprimer le(s) type partenaire(s)
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteFaculte = async (req, res) => {
    try {
        const FACULTES = JSON.parse(req.body.IDS_FACULTE);

        const facultes = await Faculte.findAll({
            where: { ID_FACULTE: FACULTES },
            attributes: ['ID_FACULTE']
        });

        if (!facultes) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Faculté non trouvé',
                data: null
            });
        }

        const deleted = await Faculte.destroy({ where: { ID_FACULTE: FACULTES } })

        res.json({
            httpStatus: 200,
            message: 'Faculté supprimé avec succès',
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
    getFacultes,
    createFaculte,
    updateFaculte,
    getFaculte,
    deleteFaculte
}
