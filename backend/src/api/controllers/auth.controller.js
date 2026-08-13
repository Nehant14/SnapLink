const config = require("../../configs/index")

function setAuthCookie(res, token){

    res.cookie(config.cookies.tokenName, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.nodeEnv === 'production',
        maxAge: config.auth.cookieMaxAgeMs
    });

}

function toPublicUser(user){

    return {
        id: user._id,
        email: user.email,
        name: user.name || null
    };

}

async function signup(req, res, next){

    try {

        const { email, password, name } = req.body;

        // req.anonSessionId comes from ensureAnonSession — it's the cookie
        // this browser already had (if any) before creating an account, so
        // signup() can migrate its 48h-default links onto the new account.
        const { user, token } = await req.app.locals.authService.signup({
            email,
            password,
            name,
            anonSessionId: req.anonSessionId || null
        });

        setAuthCookie(res, token);

        res.status(201).json({ user: toPublicUser(user) });

    } catch (err) {

        next(err);
    }

}

async function login(req, res, next){

    try {

        const { email, password } = req.body;

        const { user, token } = await req.app.locals.authService.login({ email, password });

        setAuthCookie(res, token);

        res.status(200).json({ user: toPublicUser(user) });

    } catch (err) {

        next(err);
    }

}

function logout(req, res){

    res.clearCookie(config.cookies.tokenName);
    res.status(200).json({ message: 'Logged out' });

}

// GET /me — used by the frontend on load to restore session state from
// the httpOnly cookie. Never errors: no/expired token just means "signed
// out", not a failure.
function me(req, res){

    if(!req.user){
        return res.status(200).json({ user: null });
    }

    res.status(200).json({ user: { id: req.user.id, email: req.user.email } });

}

module.exports = { signup, login, logout, me };
