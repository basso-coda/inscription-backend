const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const bearer = req.headers.authorization;
    const token = bearer && bearer.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            httpStatus: 401,
            message: "Vous n'êtes pas connecté",
            data: null,
            errors: 'Unauthorized'
        });
    }

    jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                httpStatus: 401,
                message: "Session expirée",
                data: null,
                errors: ['Unauthorized']
            });
        }

        if (err) {
            return res.status(401).json({
                httpStatus: 401,
                message: "Vous n'êtes pas connecté",
                data: null,
                errors: ['Unauthorized']
            });
        }

        req.user = decoded;

        next();
    });
}

module.exports = verifyToken;