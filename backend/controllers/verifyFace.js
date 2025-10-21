const fetch = require("node-fetch");

const verifyFace = async (req, res) => {
  try {
    const { voterId, image } = req.body;
    if (!voterId || !image) {
      return res.status(400).json({ message: "voterId and image required" });
    }

    // Call Python face verification microservice
    const pythonResponse = await fetch(
      "http://localhost:5000/api/verify-face",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId, image }),
      }
    );

    const data = await pythonResponse.json();

    if (pythonResponse.ok) {
      res.json(data);
    } else {
      res.status(pythonResponse.status).json(data);
    }
  } catch (error) {
    console.error("Face verification error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during face verification" });
  }
};

module.exports = { verifyFace };
