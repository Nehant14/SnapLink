const {rateLimit} = require("express-rate-limit")
const config = require("../../configs/index")


// this file limit number of request from an IP (below is set as 100 request per 15 min per IP)
// It limits per IP request
const limiter = rateLimit({

	windowMs: config.rateLimit.windowMs,   // in config file it is set as 15*60*1000 => 15min
	limit: config.rateLimit.max,   // in config file it is set as 100, 100 request per 15min
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	message : {
        error: "TooManyRequests",
        message: "Too Many Requests, please try again"
    }

})

module.exports = limiter;