const yup = require('yup');
const Motif = require('../../db/models/gestion_motif/Motif')
const { ValidationError, Op } = require('sequelize')

/**
 * Recupérer la liste des motifs
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getMotifs = async (req, res) => {
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

            const data = await Motif.findAndCountAll(
                {
                    where: whereCondition
                },
            );

            res.json({
                httpStatus: 200,
                message: 'Les motifs recupérés',
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
 * Créer un nouvel motif
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createMotif = async (req, res) => {
    //Gestion d'erreur de toute la modele
    try {

        const existingMotif = await Motif.findOne({ where: {DESCRIPTION: req.body.DESCRIPTION} })

        if (existingMotif) {
            return res.status(422).json({
                message: "La motif existe deja",
                data: { DESCRIPTION: "La motif existe deja dans la BDD" }
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
            // return console.log(req.body)
            const data = await Motif.create(req.body);

            res.json({
                httpStatus: 200,
                message: 'Motif créé avec succès',
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
 * Modifier un motif
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateMotif = async (req, res) => {
    try {
        const existingMotif = await Motif.findByPk(req.params.ID_MOTIF);

        if (!existingMotif) {
            return res.json({
                httpStatus: 404,
                message: 'Motif non trouvé',
                data
            });
        }

        // Verifier si le motif existe deja dans la BDD
        if (req.body.DESCRIPTION !== existingMotif.DESCRIPTION) {
            const motifAlreadyExist = await Motif.findOne({where: {DESCRIPTION: req.body.DESCRIPTION}})
            if (motifAlreadyExist) {
                return res.status(402).json({
                    message: "Le motif existe deja dans la BDD"
                })
            }
        }

        const updateSchema = yup.lazy(() => yup.object({
            DESCRIPTION: yup.string().optional(),
        }));

        const validatedData = await updateSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
        const updated = await Motif.update(validatedData, { where: { ID_MOTIF : req.params.ID_MOTIF } })

        res.json({
            httpStatus: 200,
            message: 'Motif modifié avec succès',
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
 * Trouver un seul motif
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getMotif = async (req, res) => {
    try {
        const motif = await Motif.findByPk(req.params.ID_MOTIF);

        if (!motif) {
            return res.status(404).json({
                httpStatus: 200,
                message: 'Motif non trouvé',
                data: motif
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Motif trouvé avec succès',
            data: motif
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
 * Supprimer le(s) motif(s)
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteMotif = async (req, res) => {
    try {
        const MOTIFS = JSON.parse(req.body.IDS_MOTIF);

        const motifs = await Motif.findAll({
            where: { ID_MOTIF: MOTIFS },
            attributes: ['ID_MOTIF']
        });

        if (!motifs) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Motif non trouvé',
                data: null
            });
        }

        const deleted = await Motif.destroy({ where: { ID_MOTIF: MOTIFS } })

        res.json({
            httpStatus: 200,
            message: 'Motif supprimé avec succès',
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
    getMotifs,
    createMotif,
    updateMotif,
    getMotif,
    deleteMotif
}
