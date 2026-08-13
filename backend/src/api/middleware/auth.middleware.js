const jwt = require('jsonwebtoken');
const config = require('../../configs');
const { UnauthorizedError } = require('../../utils/error');

function getTokenFromReq(req){
    return req.cookies ? req.cookies[config.cookies.tokenName] : undefined;
}

// Optional auth: decodes the JWT cookie if present and valid, sets
// req.user = { id, email }. Never blocks the request — sets req.user = null
// on any missing/invalid/expired token instead. Used on routes that behave
// differently for logged-in vs anonymous visitors but serve both (e.g.
// POST /shorten, GET /history).
function attachUser(req, res, next){

    const token = getTokenFromReq(req);

    if(!token){
        req.user = null;
        return next();
    }

    try {

        const payload = jwt.verify(token, config.auth.jwtSecret);
        req.user = { id: payload.id, email: payload.email };

    } catch (err) {

        req.user = null;
    }

    next();

}

// Mandatory auth: rejects the request with 401 if there's no valid JWT.
// Used on routes that only make sense for a logged-in user.
function requireAuth(req, res, next){

    const token = getTokenFromReq(req);

    if(!token){
        return next(new UnauthorizedError('Authentication required'));
    }

    try {

        const payload = jwt.verify(token, config.auth.jwtSecret);
        req.user = { id: payload.id, email: payload.email };
        next();

    } catch (err) {

        next(new UnauthorizedError('Invalid or expired session'));
    }

}

module.exports = { attachUser, requireAuth };
