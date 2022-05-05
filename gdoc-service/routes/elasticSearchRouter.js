const express = require("express")
const router = express.Router();
const ElasticSearchController = require("../controller/elasticSearchController")
const Auth = require("../middleware/authMiddleware")

router.get("/search", Auth.isAuthenticated, ElasticSearchController.getDocEs)
router.get("/suggest", Auth.isAuthenticated, ElasticSearchController.suggest)
router.post("/createEsDoc", ElasticSearchController.createDocEsCall)

module.exports = router;
