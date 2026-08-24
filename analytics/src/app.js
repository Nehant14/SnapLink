const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const analyticsRoutes = require('./api/routes/analytics.routes');
const notFoundHandler = require('./api/middleware/notFoundHandler');
const errorHandler = require('./api/middleware/errorHandler');

const config = require('./configs');

function createApp(clickStatService) {

    const app = express();

    // Same reasoning as the backend: credentials: true + a concrete origin
    // (not '*') is required for the browser to send the shared auth cookie
    // cross-origin to this service.
    app.use(cors({ origin: config.cors.origin, credentials: true }));
    app.use(helmet());
    app.use(express.json());
    app.use(cookieParser());

    app.get('/health', (req, res) => {
        res.send('analytics-service OK');
    });

    app.use((req, res, next) => {
        console.log(`${req.method} ${req.originalUrl}`);
        next();
    });

    // Injected here (rather than constructed inside the controller) so the
    // consumer and the HTTP API share one ClickStatService/model instance.
    app.locals.clickStatService = clickStatService;

    app.use('/api/v1/analytics', analyticsRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;

}

module.exports = { createApp };
