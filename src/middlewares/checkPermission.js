const Utilisateur = require('../db/models/administrations/Utilisateur')
const Profil = require('../db/models/administrations/Profil')
const Role = require('../db/models/administrations/Role')

const checkPermission = (role) => async (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            httpStatus: 401,
            message: "Vous n'êtes pas connecté",
            data: null,
            errors: 'Unauthorized'
        });
    }

    const user = await Utilisateur.findOne({
        where: {
            EMAIL: req.user.EMAIL,
            "$PROFILS.ROLES.DESCRIPTION$": role,
        },
        attributes: ['USER_ID'],
        include: {
            model: Profil,
            as: 'PROFILS',
            attributes: ['PROFIL_ID'],
            include: {
                model: Role,
                as: 'ROLES',
                attributes: ['ID_ROLE', 'DESCRIPTION']
            }
        }
    });

    if (!user) {
        return res.status(403).json({
            httpStatus: 403,
            message: "Vous n'êtes pas autorisé",
            data: null,
            errors: 'Forbidden'
        });
    }

    next();
};

module.exports = checkPermission;