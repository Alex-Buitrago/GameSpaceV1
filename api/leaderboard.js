export default function handler(req, res) {
    res.status(200).json([
      { name: "Player1", score: 1000 },
      { name: "Player2", score: 800 }
    ]);
  }