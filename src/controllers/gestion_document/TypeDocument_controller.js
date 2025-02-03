const yup = require('yup');
const TypeDocument = require('../../db/models/gestion_document/TypeDocument')
const { ValidationError, Op } = require('sequelize')

/**
 * Recupérer la liste des types de document
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getTypeDocuments = async (req, res) => {
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

            const data = await TypeDocument.findAndCountAll(
                {
                    where: whereCondition
                },
            );

            res.json({
                httpStatus: 200,
                message: 'Les types de document recupérés',
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
 * Créer un nouvel type de document
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createTypeDocument = async (req, res) => {
    //Gestion d'erreur de toute la modele
    try {

        const existingTypeDocument = await TypeDocument.findOne({ where: {DESCRIPTION: req.body.DESCRIPTION} })

        if (existingTypeDocument) {
            return res.status(422).json({
                message: "Le type de document existe deja",
                data: { DESCRIPTION: "Le type de document existe deja dans la BDD" }
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
            const data = await TypeDocument.create(req.body);

            res.json({
                httpStatus: 200,
                message: 'Type document créé avec succès',
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
 * Modifier un type de document
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateTypeDocument = async (req, res) => {
    try {
        const existingTypeDocument = await TypeDocument.findByPk(req.params.ID_TYPE_DOCUMENT);

        if (!existingTypeDocument) {
            return res.json({
                httpStatus: 404,
                message: 'Type document non trouvé',
                data
            });
        }

        // Verifier si le motif existe deja dans la BDD
        if (req.body.DESCRIPTION !== existingTypeDocument.DESCRIPTION) {
            const typeDocumentAlreadyExist = await TypeDocument.findOne({where: {DESCRIPTION: req.body.DESCRIPTION}})
            if (typeDocumentAlreadyExist) {
                return res.status(402).json({
                    message: "Le type document existe deja dans la BDD"
                })
            }
        }

        const updateSchema = yup.lazy(() => yup.object({
            DESCRIPTION: yup.string().optional(),
        }));

        const validatedData = await updateSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
        const updated = await TypeDocument.update(validatedData, { where: { ID_TYPE_DOCUMENT : req.params.ID_TYPE_DOCUMENT } })

        res.json({
            httpStatus: 200,
            message: 'Type document modifié avec succès',
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
 * Trouver un seul type de document
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getTypeDocument = async (req, res) => {
    try {
        const type_document = await TypeDocument.findByPk(req.params.ID_TYPE_DOCUMENT);

        if (!type_document) {
            return res.status(404).json({
                httpStatus: 200,
                message: 'Type document non trouvé',
                data: type_document
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Type document trouvé avec succès',
            data: type_document
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
 * Supprimer le(s) type(s) de document
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteTypeDocument = async (req, res) => {
    try {
        const TYPE_DOCUMENTS = JSON.parse(req.body.IDS_TYPE_DOCUMENT);

        const type_documents = await TypeDocument.findAll({
            where: { ID_TYPE_DOCUMENT: TYPE_DOCUMENTS },
            attributes: ['ID_TYPE_DOCUMENT']
        });

        if (!type_documents) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Type document non trouvé',
                data: null
            });
        }

        const deleted = await TypeDocument.destroy({ where: { ID_TYPE_DOCUMENT: TYPE_DOCUMENTS } })

        res.json({
            httpStatus: 200,
            message: 'Type document supprimé avec succès',
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
    getTypeDocuments,
    createTypeDocument,
    updateTypeDocument,
    getTypeDocument,
    deleteTypeDocument
}
