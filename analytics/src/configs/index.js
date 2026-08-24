// Same pattern as backend/src/configs/index.js: process .env once here,
// hand a single frozen config object to everything else.
//
//      .env ----> src/configs/index.js ----> then all other files
//
// Unlike the backend, RABBITMQ_URL IS required here (not optional-in-dev)
// — this whole service exists to consume the queue, so booting without it
// would just mean an analytics-service that can never receive events.

const REQUIRED_VAL = ["PORT", "MONGODB_URL", "MONGODB_NAME", "JWT_SECRET", "RABBITMQ_URL"];

function getConfig() {

    const missing = REQUIRED_VAL.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variable(s): ${missing.join(', ')}`
        );
    }

    const port = process.env.PORT;
    const node_env = process.env.NODE_ENV || 'development';

    const mongodb_url = process.env.MONGODB_URL;
    const mongodb_name = process.env.MONGODB_NAME;

    const jwt_secret = process.env.JWT_SECRET;

    const rabbitmq_url = process.env.RABBITMQ_URL;

    // Same shared cookie name the backend issues the JWT under — the
    // stats endpoint reads the same httpOnly cookie the main app set.
    const cookie_token_name = process.env.AUTH_COOKIE_NAME || 'token';

    // origin the frontend is served from — needed for CORS once cookies
    // (credentials) are involved.
    const frontend_origin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

    const configStore = {

        port,
        nodeEnv: node_env,

        db: {
            uri: mongodb_url,
            name: mongodb_name
        },

        auth: {
            jwtSecret: jwt_secret
        },

        cookies: {
            tokenName: cookie_token_name
        },

        rabbitmq: {
            url: rabbitmq_url
        },

        cors: {
            origin: frontend_origin
        },

    };

    return Object.freeze(configStore);

}

const config = getConfig();

module.exports = config;
