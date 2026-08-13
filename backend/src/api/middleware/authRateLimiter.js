const { rateLimit } = require("express-rate-limit")
const config = require("../../configs/index")

// Tighter than the general rateLimiter.js — signup/login are brute-force
// targets, so we cap them harder per IP than the shorten endpoint.
const authLimiter = rateLimit({

    windowMs: config.rateLimit.windowMs,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: "TooManyRequests",
        message: "Too many auth attempts, please try again later"
    }

})

module.exports = authLimiter;
