
const express = require("express")
const { signUp, signIn } = require("../controller/imamController")
const verifyToken = require("../middlewares/auth")

const router = express.Router()

router.post("/signUp", verifyToken, signUp)
router.post("/signIn", verifyToken, signIn);

module.exports = router