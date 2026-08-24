const publisher = require('../../infrastructure/rabbitmq/publisher');

async function resolve(req, res, next) {


    try {

        // app.use(express.json()); we will this in app.js to convert all req to json format so req.params work correctly
        const { shortCode } = req.params;

        const { longUrl, userId } = await req.app.locals.urlShortenerService.resolveShortCode(shortCode);

        // Fire-and-forget — publish() never throws/rejects (see
        // infrastructure/rabbitmq/publisher.js), so this never delays or
        // risks the redirect below, even if RabbitMQ is down or unset.
        publisher.publish('click.recorded', {
            shortCode,
            userId,
            timestamp: new Date().toISOString(),
            referrer: req.get('Referrer') || null,
            ip: req.ip,
            userAgent: req.get('User-Agent') || null,
        });

        res.redirect(302, longUrl);

    } catch (err) {
        next(err); // NotFoundError -> errorHandler -> 404
    }

}

module.exports = { resolve };