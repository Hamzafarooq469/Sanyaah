
const express = require("express")
const { createAnnouncement, getMosquesByLocation, getAnnouncementsByMosque, updateAnnouncement, deleteAnnouncement } = require("../controller/announcementController")
const verifyToken = require("../middlewares/auth")
const router = express.Router()

router.get("/by-location", getMosquesByLocation)
router.get("/:mosqueId", getAnnouncementsByMosque)

// Protected Imam routes (require authentication)
router.post("/create", verifyToken, createAnnouncement)
router.put("/:id", verifyToken, updateAnnouncement)
router.delete("/:id", verifyToken, deleteAnnouncement)

module.exports = router