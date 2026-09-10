
const express = require("express")
const { signUp, signIn, googleSignUp, setupTOTP, verifyTOTP, 
    verifyTOTPOnSignIn, passkeyRegisterOptions, passkeyRegisterVerify, passkeyAuthOptions, passkeyAuthVerify
 } = require("../controller/imamController")
const verifyToken = require("../middlewares/auth")

const router = express.Router()

router.post("/signUp", signUp)
router.post("/signUp/google", verifyToken, googleSignUp);
router.post("/signIn", verifyToken, signIn);

router.post("/totp/setup", verifyToken, setupTOTP)
router.post("/totp/verify", verifyToken, verifyTOTP)
router.post("/totp/signin", verifyToken, verifyTOTPOnSignIn)

router.post("/passkey/register/options", verifyToken, passkeyRegisterOptions)
router.post("/passkey/register/verify", verifyToken, passkeyRegisterVerify)
router.post("/passkey/auth/options", passkeyAuthOptions)
router.post("/passkey/auth/verify", passkeyAuthVerify)

module.exports = router