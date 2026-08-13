
const express = require("express")
const shortenRoutes = require("./shorten.routes")
const authRoutes = require("./auth.routes")
const historyRoutes = require("./history.routes")


const router = express.Router();

router.use('/shorten', shortenRoutes)
router.use('/auth', authRoutes)
router.use('/history', historyRoutes)

module.exports = router;