import express from "express";
import { addEvent, getLifeOf, getDamageDone, removeEvent } from "../db";

const Eventrouter = express.Router();

Eventrouter.post("/", (req, res) => {
  const { lobbyId, actorId, targetId, delta, reason } = req.body;

  if (!lobbyId || !actorId || !targetId || typeof delta !== "number") {
    return res.status(400).json({ success: false, error: "Missing or invalid fields" });
  }

  try {
    console.log("Received event:", req.body);
    addEvent(lobbyId, actorId, targetId, delta, reason);
    res.status(201).json({ success: true, message: "Event added successfully" });
  } catch (err) {
    console.error("Error adding event:", err);
    res.status(500).json({ success: false, error: "Failed to add event" });
  }
});

/**
 * GET /api/events/life/:lobbyId/:playerId
 * Returns the current life total for a player
 */
Eventrouter.get("/life/:lobbyId/:playerId", (req, res) => {
  const { lobbyId, playerId } = req.params;

  try {
    const life = getLifeOf(lobbyId, Number(playerId));
    res.status(200).json({ success: true, life });
  } catch (err) {
    console.error("Error getting life:", err);
    res.status(500).json({ success: false, error: "Failed to get life total" });
  }
});

/**
 * GET /api/events/damage/:lobbyId/:actorId
 * Optional query param: targetId (e.g. ?targetId=player2)
 * Returns total damage done by one player or to a specific player
 */
Eventrouter.get("/damage/:lobbyId/:actorId", (req, res) => {
  const { lobbyId, actorId } = req.params;
  const { targetId } = req.query;

  try {
    const actorNum = Number(actorId);
    const targetNum = targetId ? Number(targetId) : undefined;
    // Validate conversions
    if (isNaN(actorNum)) {
      return res.status(400).json({ success: false, error: "Invalid actorId" });
    }
    if (targetId && isNaN(targetNum!)) {
      return res.status(400).json({ success: false, error: "Invalid targetId" });
    }

    const damage = getDamageDone(lobbyId, actorNum, targetNum);
    res.status(200).json({ success: true, damage });
  } catch (err) {
    console.error("Error getting damage:", err);
    res.status(500).json({ success: false, error: "Failed to get damage stats" });
  }
});

/**
 * DELETE /api/events/:id
 * Removes a specific life event
 */
Eventrouter.delete("/:id", (req, res) => {
  const { id } = req.params;

  try {
    const numid = Number(id);
     if (isNaN(numid)) {
      return res.status(400).json({ success: false, error: "Invalid event id" });
    }
    removeEvent(numid);
    res.status(200).json({ success: true, message: `Event ${id} removed` });
  } catch (err) {
    console.error("Error removing event:", err);
    res.status(500).json({ success: false, error: "Failed to remove event" });
  }
});

export default Eventrouter;