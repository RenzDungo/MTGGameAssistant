import db from "../db";

interface PlayerRow {
  id: number;
  lobby_id: string;
  name: string;
  initial_life: number;
  seat: number | null;
  joined_at: number;
  last_seen: number;
}

export interface JoinResult {
  rejoined: boolean;
  playerId: number;
  name: string;
}
// Prepared statements
const getPlayerStmt = db.prepare(`
  SELECT * FROM players WHERE name = ? AND lobby_id = ?
`);

const insertPlayerStmt = db.prepare(`
  INSERT INTO players (lobby_id, name, initial_life, seat, joined_at, last_seen)
  VALUES (@lobby_id, @name, @initial_life, @seat, @joined_at, @last_seen)
`);

const updatePlayerStmt = db.prepare(`
  UPDATE players
  SET last_seen = @last_seen
  WHERE name = @name AND lobby_id = @lobby_id
`);

/**
 * Joins or rejoins a player in a lobby.
 * - If player name already exists in lobby → update `last_seen`.
 * - If not → create a new record with `AUTOINCREMENT` ID.
 */
export function joinOrRejoinPlayer(
  lobbyId: string,
  name: string,
  initialLife?: number,
  seat?: number
): JoinResult {
  try {
    const existing = getPlayerStmt.get(name, lobbyId) as PlayerRow | undefined;
    const now = Date.now();

    if (existing) {
      updatePlayerStmt.run({ name, lobby_id: lobbyId, last_seen: now });
      return { rejoined: true, playerId: existing.id, name: existing.name };
    }

    const info = insertPlayerStmt.run({
      lobby_id: lobbyId,
      name,
      initial_life: initialLife ?? 40,
      seat: seat ?? null,
      joined_at: now,
      last_seen: now,
    });

    return { rejoined: false, playerId: info.lastInsertRowid as number, name };
  } catch (err) {
    console.error("❌ Error joining/rejoining player:", err);
    throw new Error("Failed to join or rejoin player");
  }
}

