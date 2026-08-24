const jwt = require('jsonwebtoken');
const config = require('../../configs');

function getTokenFromReq(req) {
    return req.cookies ? req.cookies[config.cookies.tokenName] : undefined;
}

// Mandatory auth, mirrors backend/src/api/middleware/auth.middleware.js's
// requireAuth — decodes the same httpOnly JWT cookie using the shared
// JWT_SECRET (both services must be configured with the identical secret).
function requireAuth(req, res, next) {

    const token = getTokenFromReq(req);

    if (!token) {
        return res.status(401).json({ error: 'UnauthorizedError', message: 'Authentication required' });
    }

    try {

        const payload = jwt.verify(token, config.auth.jwtSecret);
        req.user = { id: payload.id, email: payload.email };
        next();

    } catch (err) {

        return res.status(401).json({ error: 'UnauthorizedError', message: 'Invalid or expired session' });

    }

}

module.exports = { requireAuth };
