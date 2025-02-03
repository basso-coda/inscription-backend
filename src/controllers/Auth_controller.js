const yup = require("yup");
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");

const Utilisateur = require("../db/models/administrations/Utilisateur");
const { Op } = require("sequelize");
const Profil = require("../db/models/administrations/Profil");

/**
 * Authentifier un utilisateur
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const login = async (req, res) => {
    try {

        const { EMAIL, MOT_DE_PASSE } = req.body;

        const loginSchema = yup.object({
            EMAIL: yup.string().email().required(),
            MOT_DE_PASSE: yup.string().required()
        });

        await loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

        const utilisateur = await Utilisateur.findOne({
            include: { model: Profil, as: 'profil' },
            where: {
                [Op.or]: [{ EMAIL }, { USERNAME: EMAIL }],
            },
        });

        // Vérifier si l'utilisateur n'existe pas dans la base
        if (!utilisateur) {
            return res.status(422).json({
                httpStatus: 422,
                message: 'Erreur de validation',
                // Géstion d'erreur d'insertion des données"Erreur de validation des données",
                data: null,
                errors: { EMAIL: "Identifiants incorrects" }
            })
        }

        // Vérifier si l'utilisateur est actif ou pas
        if (!utilisateur.IS_ACTIVE) {
            return res.status(422).json({
                httpStatus: 422,
                message: "Erreur de validation des données",
                data: null,
                errors: { EMAIL: "Ce compte est désactivé" }
            })
        }
        
        // Vérifier si l'utilisateur a mal saisi son mot de passe
        if (!(await bcrypt.compare(MOT_DE_PASSE, utilisateur.MOT_DE_PASSE))) {
            return res.status(422).json({
                httpStatus: 422,
                message: "Erreur de validation des données",
                data: null,
                errors: { MOT_DE_PASSE: "Mot de passe incorrect" }
            })
        }

        // Il faut jamais divulguer le mot de passe
        delete utilisateur.dataValues.MOT_DE_PASSE;

        const token = jwt.sign(
            { EMAIL: utilisateur.EMAIL, ID_UTILISATEUR: utilisateur.ID_UTILISATEUR, profil: utilisateur.profil.DECRIPTION },
            process.env.JWT_PRIVATE_KEY, {
            expiresIn: "1h",
        })

        return res.json({
            httpStatus: 200,
            message: 'Utilisateur connecté avec succès',
            data: {
                ...utilisateur.dataValues, token
            }
        })


    } catch (error) {
        // console.log(error);

        if (error instanceof yup.ValidationError) {
            return res.status(422).json({
                httpStatus: 422,
                message: 'Erreur de validation des données',
                data: null,
                errors: error.inner.reduce((acc, curr) => {
                    if (curr.path) {
                        return { ...acc, [curr.path]: curr.errors[0] }
                    }
                }, {}),
            })
        }

        return res.status(500).json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: null
        })
    }
}

/**
 * Créer un utilisateur
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const changePassword = async (req, res) => {
    const { ID_UTILISATEUR, CURRENT_MOT_DE_PASSE, MOT_DE_PASSE } = req.body;

    // Géstion d'erreur de toute la méthode
    const passwordSchema = yup.lazy(() => yup.object({
        ID_UTILISATEUR: yup.number().required(),
        CURRENT_MOT_DE_PASSE: yup.string().required(),
        MOT_DE_PASSE: yup.string().required().min(8),
        CONFIRM_MOT_DE_PASSE: yup.string().required().oneOf([yup.ref('MOT_DE_PASSE'), null], 'Passwords must match'),
    }));

    try {
        await passwordSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

        const utilisateur = await Utilisateur.findByPk(ID_UTILISATEUR);

        if (!utilisateur) {
            return res.status(404).json({
                httpStatus: 404,
                message: "Utilisateur non trouvé",
                data: null
            })
        }

        if (!(await bcrypt.compare(CURRENT_MOT_DE_PASSE, utilisateur.MOT_DE_PASSE))) {
            return res.status(422).json({
                httpStatus: 422,
                message: "Erreur de validation des données",
                data: null,
                errors: { CURRENT_MOT_DE_PASSE: "Mauvais mot de passe fourni" }
            })
        }

        const salt = await bcrypt.genSalt(10)
        const NEW_MOT_DE_PASSE = await bcrypt.hash(MOT_DE_PASSE, salt)

        await Utilisateur.update(
            { MOT_DE_PASSE: NEW_MOT_DE_PASSE },
            { where: { ID_UTILISATEUR: req.body.ID_UTILISATEUR } }
        );

        res.status(200).json({
            httpStatus: 201,
            message: 'Mot passe changé avec succès',
            data: null
        });

    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return res.status(422).json({
                httpStatus: 422,
                message: 'Erreur de validation des données',
                data: null,
                errors: error.inner.reduce((acc, curr) => {
                    if (curr.path) {
                        return { ...acc, [curr.path]: curr.errors[0] }
                    }
                }, {}),
            })
        }

        return res.status(500).json({
            message: 'Erreur interne du serveur',
            httpStatus: 500,
            data: null
        })
    }
}

module.exports = {
    login,
    changePassword
}