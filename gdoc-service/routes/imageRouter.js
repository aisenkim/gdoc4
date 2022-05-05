const express = require("express")
const router = express.Router();
const ImageController = require("../controller/ImageController")
const multer = require("multer")
const Auth = require("../middleware/authMiddleware")

const upload = multer({dest: "uploads"});

router.post("/upload", upload.single("file"), ImageController.uploadSingleImage)
router.get("/access/:MEDIAID", Auth.isAuthenticated, ImageController.getSingleImage);

module.exports = router;