const express = require("express")
const historyController = require("../controllers/history.controller")

const router = express.Router();

// attachUser + ensureAnonSession already ran globally in app.js, so this
// route just reads req.user / req.anonSessionId — it works for both a
// logged-in visitor and an anonymous one with a session cookie.
router.get('/', historyController.get);

module.exports = router;
