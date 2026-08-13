const express = require("express")
const authLimiter = require("../middleware/authRateLimiter")
const validateRequest = require("../middleware/validateRequest")
const { signupSchema, loginSchema } = require("../validators/auth.schema")
const authController = require("../controllers/auth.controller")

const router = express.Router();

router.post('/signup', authLimiter, validateRequest(signupSchema), authController.signup);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);

module.exports = router;
