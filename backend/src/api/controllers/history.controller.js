const config = require("../../configs/index")

async function get(req, res, next){

    try {

        const userId = req.user?.id || null;
        // req.anonSessionId is set by ensureAnonSession — only meaningful
        // (and only read) when there's no logged-in user.
        const anonSessionId = userId ? null : (req.anonSessionId || null);

        const records = await req.app.locals.urlShortenerService.getHistory(userId, anonSessionId);

        const items = records.map((r) => ({
            shortUrl: `${config.baseUrl}/${r.shortURL}`,
            longUrl: r.originalURL,
            createdAt: r.created_at,
            expiresAt: r.expiresAt,   // null means "never expires"
        }));

        res.status(200).json({ items });

    } catch (err) {

        next(err);
    }

}

module.exports = { get };
