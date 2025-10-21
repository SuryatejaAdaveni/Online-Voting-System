const express = require("express");
const router = express.Router();
const { castVote } = require("../controllers/voteController"); // Adjust path

router.post("/cast-vote", castVote);

module.exports = router;
