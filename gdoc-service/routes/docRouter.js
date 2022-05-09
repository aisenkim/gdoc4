const express = require("express")
const router = express.Router();
const DocController = require("../controller/docController")
const Auth = require("../middleware/authMiddleware")

const docController = require("../controller/docController")
const {Doc} = require("sharedb/lib/client");

router.post("/delete",  DocController.deleteDoc)
router.post("/create", Auth.isAuthenticated, DocController.createDoc)
router.get("/list", Auth.isAuthenticated, DocController.listDoc)
router.get("/connect/:DOCID/:UID", Auth.isAuthenticated, DocController.getDocument)
router.post("/op/:DOCID/:UID",  DocController.submitDeltaOp)
router.get("/get/:DOCID/:UID", Auth.isAuthenticated, DocController.getDocHtml)
router.post("/presence/:DOCID/:UID", DocController.submitPresence)
router.get("/notag/get/:DOCID/:UID", DocController.getDocHtmlWithNoTag)

module.exports = router;
