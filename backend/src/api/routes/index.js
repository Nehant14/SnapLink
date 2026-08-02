
const express = require("express")
const shortenRoutes = require("./shorten.routes")


const router = express.Router();

router.use('/shorten', shortenRoutes)

module.exports = router;