// server.js — Chelsea FC Scores Tracker Back-End
// Module 6 & 7 Capstone: Express Integration & Cloud Deployment

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────
// Parse incoming JSON bodies
app.use(express.json());

// Simple request-logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Serve static front-end files from /public
app.use(express.static(path.join(__dirname, "public")));

// ─── In-Memory Data Store ──────────────────────────────────────
// Seeded with some Chelsea match results
let matches = [
  {
    id: 1,
    opponent: "Arsenal",
    date: "2025-04-20",
    homeAway: "Home",
    chelseaScore: 3,
    opponentScore: 1,
    competition: "Premier League",
    scorer: "Cole Palmer (2), Nicolas Jackson",
  },
  {
    id: 2,
    opponent: "Manchester City",
    date: "2025-04-12",
    homeAway: "Away",
    chelseaScore: 2,
    opponentScore: 2,
    competition: "Premier League",
    scorer: "Noni Madueke, Enzo Fernandez",
  },
  {
    id: 3,
    opponent: "Real Madrid",
    date: "2025-04-08",
    homeAway: "Home",
    chelseaScore: 1,
    opponentScore: 0,
    competition: "Champions League",
    scorer: "Cole Palmer",
  },
  {
    id: 4,
    opponent: "Liverpool",
    date: "2025-03-30",
    homeAway: "Away",
    chelseaScore: 0,
    opponentScore: 2,
    competition: "Premier League",
    scorer: "—",
  },
  {
    id: 5,
    opponent: "Tottenham",
    date: "2025-03-16",
    homeAway: "Home",
    chelseaScore: 4,
    opponentScore: 0,
    competition: "Premier League",
    scorer: "Palmer, Jackson (2), Sancho",
  },
];

let nextId = matches.length + 1;

// ─── Helper: compute result label ────────────────────────────
function getResult(chelseaScore, opponentScore) {
  if (chelseaScore > opponentScore) return "W";
  if (chelseaScore < opponentScore) return "L";
  return "D";
}

// ─── API Routes ───────────────────────────────────────────────

// GET /api/items — return all matches + a summary stat block
app.get("/api/items", (req, res) => {
  const enriched = matches.map((m) => ({
    ...m,
    result: getResult(m.chelseaScore, m.opponentScore),
  }));

  const wins = enriched.filter((m) => m.result === "W").length;
  const draws = enriched.filter((m) => m.result === "D").length;
  const losses = enriched.filter((m) => m.result === "L").length;
  const goalsFor = enriched.reduce((sum, m) => sum + m.chelseaScore, 0);
  const goalsAgainst = enriched.reduce((sum, m) => sum + m.opponentScore, 0);

  // Read team name from environment variable (demonstrates process.env usage)
  const teamName = process.env.TEAM_NAME || "Chelsea FC";

  res.json({
    teamName,
    summary: { played: enriched.length, wins, draws, losses, goalsFor, goalsAgainst },
    matches: enriched,
  });
});

// POST /api/items — add a new match result
app.post("/api/items", (req, res) => {
  const { opponent, date, homeAway, chelseaScore, opponentScore, competition, scorer } =
    req.body;

  // Basic validation
  if (!opponent || date === undefined || chelseaScore === undefined || opponentScore === undefined) {
    return res.status(400).json({ error: "Missing required fields: opponent, date, chelseaScore, opponentScore" });
  }

  const newMatch = {
    id: nextId++,
    opponent,
    date,
    homeAway: homeAway || "Home",
    chelseaScore: Number(chelseaScore),
    opponentScore: Number(opponentScore),
    competition: competition || "Premier League",
    scorer: scorer || "—",
  };

  matches.unshift(newMatch); // newest first
  res.status(201).json({ ...newMatch, result: getResult(newMatch.chelseaScore, newMatch.opponentScore) });
});

// ─── Catch-all: serve index.html for SPA routing ──────────────
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Chelsea Tracker server running on port ${PORT}`);
  console.log(`Team: ${process.env.TEAM_NAME || "Chelsea FC"}`);
});
