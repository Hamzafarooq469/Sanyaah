

const express = require("express")
const verifyToken = require("../middlewares/auth")
const { mosqueSetup, myMosque } = require("../controller/mosqueController")

const router = express.Router()

router.post("/mosqueSetup", verifyToken, mosqueSetup)
router.get("/myMosque", verifyToken, myMosque)

module.exports = router