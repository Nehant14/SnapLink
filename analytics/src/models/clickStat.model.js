const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// this is our mongoose schema
const clickStatSchema = new Schema({

    shortCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // owner of the link this shortCode points to, or null for anonymous
    // links. Set from the first click event's userId and never changed
    // after — a link's ownership doesn't change over its lifetime.
    userId: {
        type: String,
        default: null,
        index: true
    },

    // it will be the total clicks on the shorten link of the particular redirect website
    // like : youtube.com/ekafjkajs -> snaplink.com/hj => total click on shortenlink is the totalClicks
    totalClicks: {
        type: Number,
        default: 0
    },

    // it is the website on which your shorten link was present and redirected from, ex: someone pasted your shorten
    // link on twitter, and about 200 people clicked on it then it will have [host : twitter.com, count: 200]
    // also but totalClicks > referer.count because not everyone will click on the same website shorten link,
    // some will directly copy it and paste it in diff tab or browser that will have null host
    referrers: [{
        host: { type: String, required: true },
        count: { type: Number, default: 0 }
    }],

    // one bucket per calendar day (UTC), so the timeline is a display-ready
    // list without needing to re-aggregate raw events on every read.
    timeline: [{
        date: { type: String, required: true },  // 'YYYY-MM-DD'
        count: { type: Number, default: 0 }
    }],

    lastClickAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' }
});

const ClickStat = mongoose.model('ClickStat', clickStatSchema);

module.exports = ClickStat;
