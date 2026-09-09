
const express = require("express")
const { signUp, signIn, googleSignUp } = require("../controller/imamController")
const verifyToken = require("../middlewares/auth")

const router = express.Router()

router.post("/signUp", signUp)
router.post("/signUp/google", verifyToken, googleSignUp);
router.post("/signIn", verifyToken, signIn);

module.exports = router