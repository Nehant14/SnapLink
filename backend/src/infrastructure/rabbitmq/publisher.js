// Fire-and-forget publisher for click events. The redirect path (the
// hottest, most latency-sensitive route in the app) must never be slowed
// down or broken by RabbitMQ being unavailable — every public method here
// swallows its own errors and logs instead of throwing.

const amqplib = require('amqplib');
const config = require('../../configs');

const QUEUE_NAME = 'click_events';

let connection = null;
let channel = null;
// Prevents overlapping connect() calls (e.g. one from server.js on boot
// and another triggered by a publish() racing in before that resolves).
let connecting = null;

async function connect() {

    if (channel) return channel;

    if (!config.rabbitmq.url) {
        console.warn('[rabbitmq] RABBITMQ_URL not set — publisher staying disabled.');
        return null;
    }

    if (connecting) return connecting;

    connecting = (async () => {

        try {

            connection = await amqplib.connect(config.rabbitmq.url);
            channel = await connection.createChannel();
            await channel.assertQueue(QUEUE_NAME, { durable: true });

            console.log('[rabbitmq] publisher connected, queue asserted:', QUEUE_NAME);

            // If the connection drops later (network blip, broker restart),
            // don't crash the process — just null everything out so the
            // next publish() attempt reconnects, and every publish in
            // between quietly no-ops.
            connection.on('error', (err) => {
                console.error('[rabbitmq] connection error:', err.message);
            });

            connection.on('close', () => {
                console.warn('[rabbitmq] connection closed — publishing disabled until reconnect.');
                channel = null;
                connection = null;
            });

            return channel;

        } catch (err) {

            console.error('[rabbitmq] failed to connect:', err.message);
            channel = null;
            connection = null;
            return null;

        } finally {
            connecting = null;
        }

    })();

    return connecting;

}

// Fire-and-forget: never rejects, never blocks the caller (e.g. a redirect).
async function publish(routingKey, payload) {

    try {

        const ch = channel || await connect();

        if (!ch) {
            // No RabbitMQ configured/available — silently skip. This is
            // expected in local dev without RABBITMQ_URL set.
            return;
        }

        ch.sendToQueue(
            QUEUE_NAME,
            Buffer.from(JSON.stringify({ routingKey, ...payload })),
            { persistent: true }
        );

    } catch (err) {
        // Never let a publish failure affect the caller.
        console.error(`[rabbitmq] publish failed for "${routingKey}":`, err.message);
    }

}

async function close() {

    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
    } catch (err) {
        console.error('[rabbitmq] error during close:', err.message);
    } finally {
        channel = null;
        connection = null;
    }

}

module.exports = { connect, publish, close };
