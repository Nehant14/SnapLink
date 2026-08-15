const DOTENV = require("dotenv");
DOTENV.config();

const { createApp } = require('./src/app');
const config = require('./src/configs');
const { connectDB, closeDB } = require('./src/configs/database');
const publisher = require('./src/infrastructure/rabbitmq/publisher');

let server;

async function start() {

    try {

        // connect to MongoDB before accepting any traffic
        await connectDB();

        // Non-fatal: if RabbitMQ is unreachable (or RABBITMQ_URL isn't set
        // in dev), log and keep booting — click-event publishing just
        // no-ops until it reconnects, the redirect path never depends on it.
        await publisher.connect();

        const app = createApp();

        // config.port is port available in config file
        server = app.listen(config.port, () => {
            console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }

}

// Graceful shutdown, stop accepting new requests, close DB connection,
// then exit cleanly. Important so in-flight requests aren't just killed
// mid-response when the process is asked to stop (e.g. by Docker, PM2,
// or a deploy tool sending SIGTERM).
async function shutdown(signal) {

    console.log(`${signal} received, shutting down gracefully...`);

    if (server) {
        server.close(async () => {
            console.log('HTTP server closed');
            await publisher.close();
            await closeDB();
            process.exit(0);
        });
    } else {
        await publisher.close();
        await closeDB();
        process.exit(0);
    }

}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();