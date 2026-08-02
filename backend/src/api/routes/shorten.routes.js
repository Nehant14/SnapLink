const express = require("express")
const rateLimiter = require("../middleware/rateLimiter")
const validateRequest = require("../middleware/validateRequest")
const {shortenSchema} = require("../validators/shorten.schema")
const shortenController = require("../controllers/shorten.controller")

// router is like app only but router are used for grouping similar routes and then they all merge in express app 
const router = express.Router();

// when someone send request to '/' then this one rund, you can see validateRequest is provided with shortenSchema as argumnet as it need schema as argument
router.post('/', rateLimiter, validateRequest(shortenSchema), shortenController.create)

module.exports = router