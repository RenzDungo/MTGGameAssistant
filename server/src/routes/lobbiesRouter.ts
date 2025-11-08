import express from "express";
import { createLobby, getLobby } from "../controller/lobby";
import { joinOrRejoinPlayer } from "../controller/player";
import { getLobbyIdByCode, getPlayerById, getPlayersbyLobbyCode } from "../db";
import { getPlayersByLobby } from "../db";
const lobbiesRouter = express.Router();
export interface LobbyRow {
  id: string;
  code: string;
  created_at: number;
}
// POST /api/lobbies
lobbiesRouter.post("/lobbies", (req, res) => {
  console.log("📩 Received POST /api/lobbies");
  try {
    const lobby = createLobby();
    res.status(201).json({lobby});
  } catch (err) {
    console.error("Error creating lobby:", err);
    res.status(500).json({ error: "Failed to create lobby" });
  }
});

// GET /api/lobbies/:code
lobbiesRouter.get("/lobbies/:code", (req, res) => {
  const { code } = req.params;
  const lobby = getLobby(code);

  if (!lobby) return res.status(404).json({ error: "Lobby not found" });
  res.json(lobby);
});

// 🎯 POST /api/lobbies/:code/join — Join or rejoin a lobby
lobbiesRouter.post("/lobbies/:code/join", (req, res) => {
  const { code } = req.params;
  const { name, initialLife, seat } = req.body;

  const lobby = getLobby(code) as LobbyRow;
  if (!lobby) {
    return res.status(404).json({ error: "Lobby not found" });
  }

  try {
    // Use our new player join/rejoin function
    const result = joinOrRejoinPlayer(lobby.id, name, initialLife, seat);
    const player = getPlayerById(result.playerId);
    console.log("joinOrRejoinPlayer returned:", player);
    res.status(201).json({
      success:true,
      message: result.rejoined ? "Player rejoined" : "Player joined",
      lobbyCode: code,
      player,
    });
  } catch (err) {
    console.error("Error joining/rejoining lobby:", err);
    res.status(500).json({ error: "Failed to join or rejoin lobby" });
  }
});

// GET /api/lobbies/:code/players
lobbiesRouter.get("/lobbies/:code/players", (req, res) => {
  const { code } = req.params;
  try {
    const lobbyId = getLobbyIdByCode(code);
    if (!lobbyId) {
      return res.status(404).json({
        success: false,
        error: `Lobby with code "${code}" not found`,
      });
    }

    const players = getPlayersByLobby(lobbyId);
    res.status(200).json({ success: true, players });
  } catch (err) {
    console.error("Error fetching players:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch players",
    });
  }
});

export default lobbiesRouter;
