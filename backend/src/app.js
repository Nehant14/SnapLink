const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')

const routes = require('./api/routes');
const notFoundHandler = require('./api/middleware/notFoundHandler');
const errorHandler = require('./api/middleware/errorHandler');
const { attachUser } = require('./api/middleware/auth.middleware');
const ensureAnonSession = require('./api/middleware/anonSession.middleware');

const MongoUrlRepository = require('./repositories/mongoUrl.repository');
const MongoUserRepository = require('./repositories/mongoUser.repository');
const { redisCache } = require('./cache/redisCache');
const RangeAllocator = require('./infrastructure/IdGenerator/rangeAllocator');
const { encode } = require('./infrastructure/IdGenerator/base62');
const UrlShortenerService = require('./services/urlShortener.service');
const AuthService = require('./services/auth.service');

const config = require('./configs');


function createApp() {

    const app = express();

    // credentials: true is required so the browser will actually send/accept
    // the httpOnly auth + anon-session cookies cross-origin; wildcard '*'
    // origin is not allowed by browsers once credentials are involved, so
    // this pulls a concrete origin from config instead of cors() with no options.
    app.use(cors({ origin: config.cors.origin, credentials: true }));
    app.use(helmet());
    //express.json() is middleware that parses incoming requests with a JSON body and stores the parsed object in req.body.
    app.use(express.json());
    app.use(cookieParser());


    app.get('/health', (req ,res) => {
        res.send('Hello World');
    })


    // simple request logger swap for pino/morgan later 
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.originalUrl}`);
        next();
    });

    // Run globally, before routing: every request downstream can rely on
    // req.user (object or null) and req.anonSessionId (set unless logged in)
    // being ready, instead of each route wiring these up itself.
    app.use(attachUser);
    app.use(ensureAnonSession);

    const urlRepository = new MongoUrlRepository();
    const userRepository = new MongoUserRepository();
    const allocator = new RangeAllocator(config.idGen.blockSize);

    app.locals.urlShortenerService = new UrlShortenerService(
        urlRepository,
        redisCache,
        allocator,
        encode,
        config.anonSession.linkTtlMs
    );

    app.locals.authService = new AuthService(
        userRepository,
        urlRepository,
        config.auth
    );

    // routes
    app.use('/api/v1', routes);            // /api/v1/shorten, /api/v1/auth, /api/v1/history
    app.use('/', require('./api/routes/redirect.routes')); // short codes live at root, e.g. GET /:shortCode

    // fallback handlers
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;

}


module.exports = {createApp};