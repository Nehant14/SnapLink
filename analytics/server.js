const DOTENV = require('dotenv');
DOTENV.config();

const { createApp } = require('./src/app');
const config = require('./src/configs');
const { connectDB, closeDB } = require('./src/configs/database');
const { startConsumer, closeConsumer } = require('./src/infrastructure/rabbitmq/consumer');
const ClickStatService = require('./src/services/clickStat.service');

let server;

async function start() {

    try {

        await connectDB();

        const clickStatService = new ClickStatService();

        await startConsumer(clickStatService);

        const app = createApp(clickStatService);

        server = app.listen(config.port, () => {
            console.log(`analytics-service running on port ${config.port} [${config.nodeEnv}]`);
        });

    } catch (err) {
        console.error('Failed to start analytics-service:', err);
        process.exit(1);
    }

}

async function shutdown(signal) {

    console.log(`${signal} received, shutting down analytics-service gracefully...`);

    if (server) {
        server.close(async () => {
            console.log('HTTP server closed');
            await closeConsumer();
            await closeDB();
            process.exit(0);
        });
    } else {
        await closeConsumer();
        await closeDB();
        process.exit(0);
    }

}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
