const crypto = require('crypto');
const config = require('../../configs');

// Runs after attachUser. Logged-in requests don't need an anon session id
// (their links are tracked by userId instead), so this is a no-op for them.
// For everyone else, it reads the anon_session_id cookie, or mints a new
// one on first visit, and sets req.anonSessionId. The cookie is long-lived
// (default 90 days) so history survives closing the tab — much longer than
// the 48h the links themselves live for, since the cookie's job is just to
// remember "which browser" across visits, including after all of that
// browser's links have already expired.
function ensureAnonSession(req, res, next){

    if(req.user){
        return next();
    }

    let anonId = req.cookies ? req.cookies[config.anonSession.cookieName] : undefined;

    if(!anonId){

        anonId = crypto.randomUUID();

        res.cookie(config.anonSession.cookieName, anonId, {
            httpOnly: true,
            sameSite: 'lax',
            secure: config.nodeEnv === 'production',
            maxAge: config.anonSession.maxAgeMs
        });
    }

    req.anonSessionId = anonId;

    next();

}

module.exports = ensureAnonSession;
