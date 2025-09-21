const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");

// Your existing getElectionResults function
const getElectionResults = async (req, res) => {
  try {
    // Aggregate votes per candidate
    const voteCounts = await Vote.aggregate([
      {
        $group: {
          _id: "$candidateId",
          votes: { $sum: 1 },
        },
      },
    ]);

    // Fetch all candidates
    const candidates = await Candidate.find();

    // Calculate total votes
    const totalVotes = voteCounts.reduce((sum, c) => sum + c.votes, 0);

    // Map candidateId to vote count
    const voteMap = {};
    voteCounts.forEach((vc) => {
      voteMap[vc._id.toString()] = vc.votes;
    });

    // Prepare results array
    const results = candidates.map((candidate) => {
      const votes = voteMap[candidate._id.toString()] || 0;
      return {
        id: candidate._id,
        candidate: candidate.candidate,
        party: candidate.party,
        partyImg: candidate.partySymbolUrl,
        votes,
        percentage:
          totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0,
        status: candidate.status || "",
      };
    });

    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);

    // Set status for winner and others
    if (results.length > 0) {
      results[0].status = "ELECTED";
      for (let i = 1; i < results.length; i++) {
        if (!results[i].status || results[i].status === "ELECTED") {
          results[i].status = "CONCEDED";
        }
      }
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating results." });
  }
};

// Your example getHistoricalResults function
const getHistoricalResults = async (req, res) => {
  try {
    const historicalData = [
      {
        timestamp: new Date("2025-11-04T10:00:00Z"),
        candidates: [
          { id: "candidateId1", votes: 100 },
          { id: "candidateId2", votes: 80 },
        ],
      },
      {
        timestamp: new Date("2025-11-04T14:00:00Z"),
        candidates: [
          { id: "candidateId1", votes: 150 },
          { id: "candidateId2", votes: 120 },
        ],
      },
    ];
    res.json(historicalData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating historical results." });
  }
};

// Your example getRegionalResults function
const getRegionalResults = async (req, res) => {
  try {
    const regionalData = [
      {
        region: "Region A",
        totalVotes: 500,
        candidates: [
          { id: "candidateId1", votes: 300 },
          { id: "candidateId2", votes: 200 },
        ],
      },
      {
        region: "Region B",
        totalVotes: 400,
        candidates: [
          { id: "candidateId1", votes: 250 },
          { id: "candidateId2", votes: 150 },
        ],
      },
    ];
    res.json(regionalData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating regional results." });
  }
};

module.exports = {
  getElectionResults,
  getHistoricalResults,
  getRegionalResults,
};
