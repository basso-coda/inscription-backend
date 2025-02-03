const yup = require('yup');
const Classe = require('../../db/models/gestion_facultes/Classe')
const Departement = require('../../db/models/gestion_facultes/Departement')
const { ValidationError, Op } = require('sequelize')

/**
 * Recupérer la liste des classes
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getClasses = async (req, res) => {
    const {search} = req.query;
    try {

            // Recherche globale
        let globalSearchColumns = [];

        let searchConditions = [];
        if (search && search.trim() !== "") {
            globalSearchColumns = [
            "DESCRIPTION",
            "$departement.DESCRIPTION$"];
            globalSearchColumns.forEach(column => {
            searchConditions.push({ [column]: { [Op.substring]: search } });
            });
        }
        // console.log("=======",searchConditions);
        const whereCondition = searchConditions.length > 0 ? { [Op.or]: searchConditions } : {};

            const data = await Classe.findAndCountAll(
                {
                    where: whereCondition,
                    include: {
                        model: Departement,
                        as: 'departement'
                    }
                },
            );

            res.json({
                httpStatus: 200,
                message: 'Les classes recupérés',
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
 * Créer une nouvelle classe
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createClasse = async (req, res) => {
    //Gestion d'erreur de toute la modele
    try {

        const existingClasse = await Classe.findOne({ where: {DESCRIPTION: req.body.DESCRIPTION} })

        if (existingClasse) {
            return res.status(422).json({
                message: "La classe existe deja",
                data: { DESCRIPTION: "La classe existe deja dans la BDD" }
            })
        }

        const registerSchema = yup.lazy(() => yup.object({
            DEPARTEMENT_ID : yup.number().required(),
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
            const data = await Classe.create(req.body);

            res.json({
                httpStatus: 200,
                message: 'Classe créé avec succès',
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
 * Modifier un type de partenaire
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const updateClasse = async (req, res) => {
    try {
        const existingClasse = await Classe.findByPk(req.params.ID_CLASSE);

        if (!existingClasse) {
            return res.json({
                httpStatus: 404,
                message: 'Classe non trouvé',
                data
            });
        }

        // Verifier si la classe existe deja dans la BDD
        if (req.body.DESCRIPTION !== existingClasse.DESCRIPTION) {
            const classeAlreadyExist = await Classe.findOne({where: {DESCRIPTION: req.body.DESCRIPTION}})
            if (classeAlreadyExist) {
                return res.status(402).json({
                    message: "La classe existe deja dans la BDD"
                })
            }
        }

        const updateSchema = yup.lazy(() => yup.object({
            DEPARTEMENT_ID: yup.number().required(),
            DESCRIPTION: yup.string().optional(),
        }));

        const validatedData = await updateSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
        const updated = await Classe.update(validatedData, { where: { ID_CLASSE : req.params.ID_CLASSE } })

        res.json({
            httpStatus: 200,
            message: 'Classe modifié avec succès',
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
 * Trouver une seule classe
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getClasse = async (req, res) => {
    try {
        const classe = await Classe.findByPk(req.params.ID_CLASSE);

        if (!classe) {
            return res.status(404).json({
                httpStatus: 200,
                message: 'Classe non trouvé',
                data: classe
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Classe trouvé avec succès',
            data: classe
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
 * Supprimer la(es) classe(s)
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const deleteClasse = async (req, res) => {
    try {
        const CLASSES = JSON.parse(req.body.IDS_CLASSE);

        const classes = await Classe.findAll({
            where: { ID_CLASSE: CLASSES },
            attributes: ['ID_CLASSE']
        });

        if (!classes) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Classe non trouvé',
                data: null
            });
        }

        const deleted = await Classe.destroy({ where: { ID_CLASSE: CLASSES } })

        res.json({
            httpStatus: 200,
            message: 'Classe supprimé avec succès',
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
    getClasses,
    createClasse,
    updateClasse,
    getClasse,
    deleteClasse
}
