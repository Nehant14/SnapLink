const express = require('express')
const helmet = require('helmet')

const routes = require('./api/routes');
const notFoundHandler = require('./api/middleware/notFoundHandler');
const errorHandler = require('./api/middleware/errorHandler');

const MongoUrlRepository = require('./repositories/mongoUrl.repository');
const { redisCache } = require('./cache/redisCache');
const RangeAllocator = require('./infrastructure/IdGenerator/rangeAllocator');
const { encode } = require('./infrastructure/IdGenerator/base62');
const UrlShortenerService = require('./services/urlShortener.service');

const config = require('./configs');


function createApp() {

    const app = express();

    app.use(helmet());
    //express.json() is middleware that parses incoming requests with a JSON body and stores the parsed object in req.body.
    app.use(express.json());


    app.get('/health', (req ,res) => {
        res.send('Hello World');
    })


    // simple request logger swap for pino/morgan later 
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.originalUrl}`);
        next();
    });

    const urlRepository = new MongoUrlRepository();
    const allocator = new RangeAllocator(config.idGen.blockSize);

    app.locals.urlShortenerService = new UrlShortenerService(
        urlRepository,
        redisCache,
        allocator,
        encode
    );

    // routes
    app.use('/api/v1', routes);            // /api/v1/shorten
    app.use('/', require('./api/routes/redirect.routes')); // short codes live at root, e.g. GET /:shortCode

    // fallback handlers
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;

}


module.exports = {createApp};