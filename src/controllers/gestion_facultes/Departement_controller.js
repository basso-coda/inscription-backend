const yup = require('yup');
const Faculte = require('../../db/models/gestion_facultes/Faculte')
const Departement = require('../../db/models/gestion_facultes/Departement')
const { ValidationError, Op } = require('sequelize')

/**
 * Recupérer la liste des departements
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
const getDepartements = async (req, res) => {
    const {search} = req.query;
    try {

            // Recherche globale
        let globalSearchColumns = [];

        let searchConditions = [];
        if (search && search.trim() !== "") {
            globalSearchColumns = [
            "DESCRIPTION",
            "$faculte.DESCRIPTION$"];
            globalSearchColumns.forEach(column => {
            searchConditions.push({ [column]: { [Op.substring]: search } });
            });
        }
        // console.log("=======",searchConditions);
        const whereCondition = searchConditions.length > 0 ? { [Op.or]: searchConditions } : {};

            const data = await Departement.findAndCountAll(
                {
                    where: whereCondition,
                    include: {
                        model: Faculte,
                        as: 'faculte'
                    }
                },
            );

            res.json({
                httpStatus: 200,
                message: 'Les departements recupérés',
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
 * Créer un nouveau faculte
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const createDepartement = async (req, res) => {
    //Gestion d'erreur de toute la modele
    try {

        const existingDepartement = await Departement.findOne({ where: {DESCRIPTION: req.body.DESCRIPTION} })

        if (existingDepartement) {
            return res.status(422).json({
                message: "Le département existe deja",
                data: { DESCRIPTION: "Le département existe deja dans la BDD" }
            })
        }

        const registerSchema = yup.lazy(() => yup.object({
            FACULTE_ID : yup.number().required(),
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
            const data = await Departement.create(req.body);

            res.json({
                httpStatus: 200,
                message: 'Département créé avec succès',
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
const updateDepartement = async (req, res) => {
    try {
        const existingDepartement = await Departement.findByPk(req.params.ID_DEPARTEMENT);

        if (!existingDepartement) {
            return res.json({
                httpStatus: 404,
                message: 'Departement non trouvé',
                data
            });
        }

        // Verifier si le departement existe deja dans la BDD
        if (req.body.DESCRIPTION !== existingDepartement.DESCRIPTION) {
            const departementAlreadyExist = await Departement.findOne({where: {DESCRIPTION: req.body.DESCRIPTION}})
            if (departementAlreadyExist) {
                return res.status(402).json({
                    message: "Le departement existe deja dans la BDD"
                })
            }
        }

        const updateSchema = yup.lazy(() => yup.object({
            FACULTE_ID: yup.number().required(),
            DESCRIPTION: yup.string().optional(),
        }));

        const validatedData = await updateSchema.validate(req.body, {abortEarly: false, stripUnknown: true})
        const updated = await Departement.update(validatedData, { where: { ID_DEPARTEMENT : req.params.ID_DEPARTEMENT } })

        res.json({
            httpStatus: 200,
            message: 'Departement modifié avec succès',
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
const getDepartement = async (req, res) => {
    try {
        const departement = await Departement.findByPk(req.params.ID_DEPARTEMENT);

        if (!departement) {
            return res.status(404).json({
                httpStatus: 200,
                message: 'Departement non trouvé',
                data: departement
            });
        }

        res.json({
            httpStatus: 200,
            message: 'Departement trouvé avec succès',
            data: departement
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
const deleteDepartement = async (req, res) => {
    try {
        const DEPARTEMENTS = JSON.parse(req.body.IDS_DEPARTEMENT );

        const departements = await Departement.findAll({
            where: { ID_DEPARTEMENT: DEPARTEMENTS },
            attributes: ['ID_DEPARTEMENT']
        });

        if (!departements) {
            return res.status(404).json({
                httpStatus: 404,
                message: 'Departement non trouvé',
                data: null
            });
        }

        const deleted = await Departement.destroy({ where: { ID_DEPARTEMENT: DEPARTEMENTS } })

        res.json({
            httpStatus: 200,
            message: 'Departement supprimé avec succès',
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
    getDepartements,
    createDepartement,
    updateDepartement,
    getDepartement,
    deleteDepartement
}
