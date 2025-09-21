const express = require("express");
const router = express.Router();
const {
  getElectionResults,
  getHistoricalResults,
  getRegionalResults,
} = require("../controllers/resultController");

router.get("/", getElectionResults);
router.get("/historical", getHistoricalResults);
router.get("/regional", getRegionalResults);

module.exports = router;
