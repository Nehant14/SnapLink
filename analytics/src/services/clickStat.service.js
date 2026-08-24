const ClickStat = require('../models/clickStat.model');

class ClickStatService {

    constructor(model = ClickStat) {
        this.model = model;
    }

    // Pulls a display-friendly hostname out of a referrer URL, falling
    // back to 'direct' for missing/unparseable referrers (typed URLs,
    // bookmarks, most QR-code scans, etc.) rather than dropping the click.
    _referrerHost(referrer) {

        if (!referrer) return 'direct';

        try {
            return new URL(referrer).hostname || 'direct';
        } catch {
            return 'direct';
        }

    }

    _dateBucket(timestamp) {

        const d = timestamp ? new Date(timestamp) : new Date();
        return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'

    }

    // Upserts the click_stats document for this shortCode. Not wrapped in
    // a Mongo transaction (a single-node/free-tier setup here doesn't
    // reliably support them) — instead this is three small, independent
    // updates that are each individually atomic. Worst case under a race
    // is a slightly-off referrer/timeline count, which is acceptable for
    // display-only analytics; totalClicks itself is always exact since
    // it's incremented in the base upsert below.
    async record(event) {

        const { shortCode, userId = null, timestamp, referrer } = event;

        if (!shortCode) {
            console.warn('[clickStat] dropping event with no shortCode:', event);
            return;
        }

        const host = this._referrerHost(referrer);
        const date = this._dateBucket(timestamp);
        const lastClickAt = timestamp ? new Date(timestamp) : new Date();

        // 1. Base doc: create it if this is the first click ever seen for
        //    this shortCode, bump totalClicks, refresh lastClickAt.
        await this.model.findOneAndUpdate(
            { shortCode },
            {
                $inc: { totalClicks: 1 },
                $set: { lastClickAt },
                $setOnInsert: { shortCode, userId }
            },
            { upsert: true, setDefaultsOnInsert: true }
        );

        // 2. Referrer bucket: bump the existing subdoc's count...
        const referrerBump = await this.model.updateOne(
            { shortCode, 'referrers.host': host },
            { $inc: { 'referrers.$.count': 1 } }
        );

        // ...or push a new one if this host hasn't been seen before for
        // this shortCode.
        if (referrerBump.matchedCount === 0) {
            await this.model.updateOne(
                { shortCode, 'referrers.host': { $ne: host } },
                { $push: { referrers: { host, count: 1 } } }
            );
        }

        // 3. Timeline bucket: same pattern, keyed by day.
        const timelineBump = await this.model.updateOne(
            { shortCode, 'timeline.date': date },
            { $inc: { 'timeline.$.count': 1 } }
        );

        if (timelineBump.matchedCount === 0) {
            await this.model.updateOne(
                { shortCode, 'timeline.date': { $ne: date } },
                { $push: { timeline: { date, count: 1 } } }
            );
        }

    }

    async getStats(shortCode) {

        return this.model.findOne({ shortCode }).lean();

    }

}

module.exports = ClickStatService;
