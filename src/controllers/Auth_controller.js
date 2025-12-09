const yup = require("yup");
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");

const Utilisateur = require("../db/models/administrations/Utilisateur");
const { ValidationError ,Op } = require("sequelize");
const Profil = require("../db/models/administrations/Profil");
const Uploader = require('../utils/Upload');
const passwordGenerator = require('../utils/passwordGenerator');

const emailSender = require('../utils/emailSender');
const Role = require("../db/models/administrations/Role");


/**
 * Authentifier un utilisateur
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const login = async (req, res) => {
    try {

        const { EMAIL, MOT_DE_PASSE } = req.body;

        console.log(req.body)

        const loginSchema = yup.object({
            EMAIL: yup.string().email().required(),
            MOT_DE_PASSE: yup.string().required()
        });

        await loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

        const utilisateur = await Utilisateur.findOne({
            include: { model: Profil, as: 'profil', include: [{ model: Role, as: 'ROLES', through: { attributes: [] } }], },
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

        // Vérifier si l'utilisateur est le candidat ou pas
        if (utilisateur.profil.ID_PROFIL === 4) {
            return res.status(422).json({
                httpStatus: 422,
                message: "Erreur de validation des données",
                data: null,
                errors: {EMAIL: "Accès interdit aux candidats"}
            })
        }
        

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

const loginCandidat = async (req, res) => {
    try {

        const { EMAIL, MOT_DE_PASSE } = req.body;

        const loginSchema = yup.object({
            EMAIL: yup.string().email().required(),
            MOT_DE_PASSE: yup.string().required()
        });

        await loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });

        const utilisateur = await Utilisateur.findOne({
            include: { model: Profil, as: 'profil', include: [{ model: Role, as: 'ROLES', through: { attributes: [] } }], },
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

        // Vérifier si l'utilisateur est le candidat ou pas
        if (utilisateur.profil.ID_PROFIL !== 4) {
            return res.status(422).json({
                httpStatus: 422,
                message: "Erreur de validation des données",
                data: null,
                errors: {EMAIL: "Accès autorisé pour les candidats seulement"}
            })
        }
        

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

const createAccount = async (req, res) => {
    let files = {};

    // copier tous les fichiers uploadés
    for (const name in req.files) {
        files[name] = req.files[name]
    }

    // Géstion d'erreur de toute la méthode
    const utilisateurSchema = yup.lazy(() => yup.object({
        NOM: yup.string().required(),
        PRENOM: yup.string().required(),
        USERNAME: yup.string().required().when({
            is: val => val.length > 0,
            then: () => yup.string().matches(/^[0-9A-Za-z]{6,16}$/, 'Les caractères spéciaux ou les éspaces ne sont pas permis, et la longueur doit être entre 6 et 16 caractères'),
        }),
        EMAIL: yup.string().email().required(),
        TELEPHONE: yup.string().required(),

        PROFIL_ID: yup.number().required(),
        SEXE_ID: yup.number().required(),

        IMAGE: yup.mixed().test("fileSize", "Le fichier est volumineux", (value) => {
            if (!value?.size) return true // attachment is optional
            return value.size <= 200_000
        }),

    }));

    // Géstion d'erreur de validation des données

    let data = await utilisateurSchema.validate(
        { ...req.body, ...files },
        { abortEarly: false, stripUnknown: true }
    );

    // Géstion d'erreur d'insertion des données
    try {
        const salt = await bcrypt.genSalt(10)
        const randomPassword = passwordGenerator();
        const MOT_DE_PASSE = await bcrypt.hash(randomPassword, salt)

        // stocker les fichiers dans la memoire et recuperer le chemin
        for (const name in files) {
            const uploadedFile = await Uploader.save(files[name], 'utilisateurs');
            files[name] = `${req.protocol}://${req.get("host")}/${uploadedFile?.fileInfo?.fileName}`
        }
        // return console.log('Ivyo ngira mbike', req.body);
        
        const newData = await Utilisateur.create({
            ...data,
            ...files,
            MOT_DE_PASSE
        });

        // delete newData.dataValues.MOT_DE_PASSE

        // envoie l'email
        await emailSender(
            { to: data.EMAIL, subject: "Création d'un compte", },
            'creation_compte',
            {
                utilisateur: `${data.NOM} ${data.PRENOM}`,
                email: data.EMAIL,
                password: randomPassword,
                lien: `${req.protocol}://${req.get("host")}`
            }
        );

        res.status(201).json({
            httpStatus: 201,
            message: 'Utilisateur crée avec succès',
            data: newData.dataValues
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

        console.log(error)

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
            data: null
        })
    }
}

module.exports = {
    login,
    loginCandidat,
    changePassword,
    createAccount
}