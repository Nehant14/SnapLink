// Consumes the same click_events queue the backend's publisher writes to
// (see backend/src/infrastructure/rabbitmq/publisher.js) — queue name and
// durable:true must match on both sides or amqplib throws on assertQueue.

const amqplib = require('amqplib');
const config = require('../../configs');

const QUEUE_NAME = 'click_events';

let connection = null;
let channel = null;

// clickStatService is injected rather than imported directly so this stays
// testable and doesn't hard-couple the transport layer to one model/db.
async function startConsumer(clickStatService) {

    connection = await amqplib.connect(config.rabbitmq.url);
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Process one message at a time per consumer — click volume here is
    // low enough that this keeps write ordering simple (no interleaved
    // upserts for the same shortCode) without needing to shard by key.
    await channel.prefetch(1);

    console.log('[rabbitmq] consumer connected, listening on:', QUEUE_NAME);

    connection.on('error', (err) => {
        console.error('[rabbitmq] consumer connection error:', err.message);
    });

    connection.on('close', () => {
        console.warn('[rabbitmq] consumer connection closed.');
        channel = null;
        connection = null;
    });

    channel.consume(QUEUE_NAME, async (msg) => {

        if (!msg) return;

        try {

            const event = JSON.parse(msg.content.toString());

            if (event.routingKey === 'click.recorded') {
                await clickStatService.record(event);
            } else {
                console.warn('[rabbitmq] ignoring unknown routingKey:', event.routingKey);
            }

            channel.ack(msg);

        } catch (err) {

            console.error('[rabbitmq] failed to process message, dropping it:', err.message);
            // requeue=false: a malformed/failing message would otherwise
            // loop forever between redelivery and failure.
            channel.nack(msg, false, false);

        }

    });

}

async function closeConsumer() {

    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
    } catch (err) {
        console.error('[rabbitmq] error during consumer close:', err.message);
    } finally {
        channel = null;
        connection = null;
    }

}

module.exports = { startConsumer, closeConsumer };
