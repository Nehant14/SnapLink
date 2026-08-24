async function getStats(req, res, next) {

    try {

        const { shortCode } = req.params;

        const stats = await req.app.locals.clickStatService.getStats(shortCode);

        if (!stats) {

            return res.status(200).json({
                shortCode,
                totalClicks: 0,
                referrers: [],
                timeline: [],
                lastClickAt: null
            });
        }

        if (stats.userId !== req.user.id) {
            return res.status(403).json({ error: 'ForbiddenError', message: "You don't own this link" });
        }

        res.status(200).json({
            shortCode: stats.shortCode,
            totalClicks: stats.totalClicks,
            referrers: stats.referrers,
            timeline: stats.timeline,
            lastClickAt: stats.lastClickAt
        });

    } catch (err) {
        next(err);
    }

}

module.exports = { getStats };
