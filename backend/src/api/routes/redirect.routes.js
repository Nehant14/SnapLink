const express = require("express")
const redirectController = require("../controllers/redirect.controller")


const router = express.Router();

router.post('/:shortCode', redirectController.resolve)

module.exports = router;


