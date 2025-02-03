const yup = require('yup');
const TypePaiement = require('../../db/models/gestion_paiement/TypePaiement')
const { ValidationError, Op } = require('sequelize')

/**
 * Recupérer la liste des types de paiement
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getTypePaiements = async (req, res) => {
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

            const data = await TypePaiement.findAndCountAll(
                {
                    where: whereCondition
                },
            );

            res.json({
                httpStatus: 200,
                message: 'Les type de paiements recupérés',
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
const createTypePaiement = async (req, res) => {
    //Gestion d'erreur de toute la modele
    try {

        const existingMotif = await TypePaiement.findOne({ where: {DESCRIPTION: req.body.DESCRIPTION} })

        if (existingMotif) {
            return res.status(422).json({
                message: "Le type de paiement existe deja",
                data: { DESCRIPTION: "Le type de paiement existe deja dans la BDD" }
            })
        }

        const registerSchema = yup.lazy(() => yup.object({
            DESCRIPTION: yup.string().required(),
            MONTANT: yup.number().required()
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
            const data = await TypePaiement.create(req.body);

            res.json({
                httpStatus: 200,
                message: 'Type de paiement créé avec succès',
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
 * Modifier un type de paiement
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateTypePaiement = async (req, res) => {
    try {
        const existingTypePaiement = await TypePaiement.findByPk(req.params.ID_TYPE_PAIEMENT);

        if (!existingTypePaiement) {
            return res.json({
                httpStatus: 404,
                message: 'Type paiement non trouvé',
                data
            });
        }

        // Verifier si le motif existe deja dans la BDD
        if (req.body.DESCRIPTION !== existingTypePaiement.DESCRIPTION) {
            const typePaiementAlreadyExist = await TypePaiement.findOne({where: {DESCRIPTION: req.body.DESCRIPTION}})
            if (typePaiementAlreadyExist) {
                return res.status(402).json({
                    message: "Le type paiememt existe deja dans la BDD"
                })
            }
        }

        const updateSchema = yup.lazy(() => yup.object({
            DESCRIPTION: yup.string().optional(),
            MONTANT: yup.number().required()
        }));

        const validatedData = await updateSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
        const updated = await TypePaiement.update(validatedData, { where: { ID_TYPE_PAIEMENT : req.params.ID_TYPE_PAIEMENT } })

        res.json({
            httpStatus: 200,
            message: 'Type paiement modifié avec succès',
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
 * Trouver un seul type de paiement
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getTypePaiement = async (req, res) => {
    try {
        const type_paiement = await TypePaiement.findByPk(req.params.ID_TYPE_PAIEMENT);

        if (!type_paiement) {
            return res.status(404).json({
                httpStatus: 200,
                message: 'Type paiement non trouvé',
                data: type_paiement
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Type paiement trouvé avec succès',
            data: type_paiement
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
 * Supprimer le(s) type(s) de paiement
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteTypePaiement = async (req, res) => {
    try {
        const TYPE_PAIEMENTS = JSON.parse(req.body.IDS_TYPE_PAIEMENT);

        const type_paiements = await TypePaiement.findAll({
            where: { ID_TYPE_PAIEMENT: TYPE_PAIEMENTS },
            attributes: ['ID_TYPE_PAIEMENT']
        });

        if (!type_paiements) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Type paiement non trouvé',
                data: null
            });
        }

        const deleted = await TypePaiement.destroy({ where: { ID_TYPE_PAIEMENT: TYPE_PAIEMENTS } })

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
    getTypePaiements,
    createTypePaiement,
    updateTypePaiement,
    getTypePaiement,
    deleteTypePaiement
}
