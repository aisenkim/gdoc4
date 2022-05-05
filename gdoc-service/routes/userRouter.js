const express = require("express")
const router = express.Router();

const userController = require("../controller/userController")

router.post("/login", userController.login)
router.post("/logout",  userController.logout)
router.post('/signup', userController.signup)
router.get('/verify', userController.verify)

module.exports = router;