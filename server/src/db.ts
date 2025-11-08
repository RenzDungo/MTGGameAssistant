import Database from "better-sqlite3";
import { randomUUID, randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
const db = new Database("data/mtglife.db");
db.pragma("journal_mode = WAL");
import { LobbyRow } from "./routes/lobbiesRouter";
export interface LifeEvent {
  id: string;           // unique ID (UUID or generated string)
  lobby_id: string;     // which lobby this event belongs to
  actor_id: number;     // the player who caused the event
  target_id: number;    // the player affected by the event
  delta: number;        // life change (+ for heal, - for damage)
  reason?: string;      // optional reason (e.g. "combat", "spell", "ability")
}
export interface PlayerRow {
  id: number;
  lobby_id: string;
  name: string;
  initial_life: number;
  seat: number | null;
  joined_at: number;
  last_seen: number;
}

db.exec(`
CREATE TABLE IF NOT EXISTS lobbies (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- Code to join lobbies
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lobby_id TEXT NOT NULL,
  name TEXT NOT NULL,
  initial_life INTEGER NOT NULL DEFAULT 40,
  seat INTEGER,
  joined_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  FOREIGN KEY (lobby_id) REFERENCES lobbies(id) ON DELETE CASCADE,
  UNIQUE (lobby_id, id) -- ensures (id,lobby_id) pair is unique for foreign keys
);

CREATE TABLE IF NOT EXISTS life_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lobby_id TEXT NOT NULL,
  actor_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  FOREIGN KEY (lobby_id) REFERENCES lobbies(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id, lobby_id) REFERENCES players(id, lobby_id),
  FOREIGN KEY (target_id, lobby_id) REFERENCES players(id, lobby_id)
);
`);


//function for making new lobby
const insertLobby = db.prepare(`
  INSERT INTO lobbies (id, code, created_at)
  VALUES (@id, @code, @created_at)
  ON CONFLICT(id) DO NOTHING
`);

//function for checking lobby
function ensureLobby(lobbyId: string) {
  const code = uuidv4().split("-")[0]; // Creates a short code for lobbies
  insertLobby.run({
    id: lobbyId,
    code,
    created_at: Date.now()
  });
}

const getPlayerByIdStmt = db.prepare(`
  SELECT *
  FROM players
  WHERE id = ?
`);

export function getPlayerById(id: number): PlayerRow | undefined {
  return getPlayerByIdStmt.get(id) as PlayerRow | undefined;
}
export function getLobbyIdByCode(code: string): string | null {
  const stmt = db.prepare(`SELECT id FROM lobbies WHERE code = ?`);
  const result = stmt.get(code) as LobbyRow | undefined;
  return result ? result.id : null;
}

export function getPlayersByLobby(lobby_id: string){
  const stmt = db.prepare(`SELECT * FROM players WHERE lobby_id = ?`);
  return stmt.all(lobby_id);
}

export function getPlayersbyLobbyCode(code:string) {
  const lobbyId = getLobbyIdByCode(code);
  if (!lobbyId) return [];
  return getPlayersByLobby(lobbyId);
}
//Functions for events.ts 
/*
//Function for Updating a players gamestate
//Database Update for UpsertPlayer
const upsertPlayerStmt = db.prepare(`
  INSERT INTO players (id, lobby_id, name, initial_life, seat, joined_at, last_seen)
  VALUES (@id, @lobby_id, @name, @initial_life, @seat, @joined_at, @last_seen)
  ON CONFLICT(lobby_id, id) DO UPDATE SET
    last_seen = excluded.last_seen;
`);
export function upsertPlayer(
  lobbyId: string,
  name: string,
  initialLife?: number,
  seat?: number
): void {
  ensureLobby(lobbyId);
  const now = Date.now();
  upsertPlayerStmt.run({
    lobby_id: lobbyId,
    name,
    initial_life: initialLife ?? 40,
    seat: seat ?? null,
    now
  });
};
*/
//Add event function
//Database Update for AddEvent
const addEventStmt = db.prepare(`
  INSERT INTO life_events (lobby_id, actor_id, target_id, delta, reason)
  VALUES (@lobby_id, @actor_id, @target_id, @delta, @reason)
`);
export function addEvent(
  lobbyId: string,
  actorId: number,
  targetId: number,
  delta: number,
  reason?: string
): void {
  // optional safety: make sure lobby exists
  ensureLobby(lobbyId);

  addEventStmt.run({
    lobby_id: lobbyId,
    actor_id: actorId,
    target_id: targetId,
    delta,
    reason: reason ?? null  // store null if no reason provided
  });
}


//Get function for Lifetotal
export function getLifeOf(lobbyId: string, playerId: number): number {
  const result = db
    .prepare(
      `SELECT IFNULL(SUM(delta), 0) AS total 
       FROM life_events 
       WHERE target_id = ? AND lobby_id = ?`
    )
    .get(playerId, lobbyId) as {total: number} | undefined;

  const totalChange = result?.total ?? 0;
  const baseLife = 40; // default starting life

  return baseLife + totalChange;
}

export function getDamageDone(lobbyId: string, actorId: number, targetId?: number): number {
  if (targetId) {
    // Damage done to one specific player
    const stmt = db.prepare(`
      SELECT SUM(CASE WHEN delta < 0 THEN -delta ELSE 0 END) AS total
      FROM life_events
      WHERE lobby_id = ? AND actor_id = ? AND target_id = ?;
    `);
    const row = stmt.get(lobbyId, actorId, targetId) as {total: number};
    return row?.total ?? 0;
  } else {
    // Total damage done overall
    const stmt = db.prepare(`
      SELECT SUM(CASE WHEN delta < 0 THEN -delta ELSE 0 END) AS total
      FROM life_events
      WHERE lobby_id = ? AND actor_id = ?;
    `);
    const row = stmt.get(lobbyId, actorId) as {total: number};
    return row?.total ?? 0;
  }
}

// Prepared statement for deleting an event
const removeEventStmt = db.prepare(`
  DELETE FROM life_events
  WHERE id = ?
`);

// Function to remove an event by its ID
export function removeEvent(eventId: number): void {
  const info = removeEventStmt.run(eventId);

  if (info.changes === 0) {
    console.warn(`⚠️ No event found with ID ${eventId} to remove.`);
  } else {
    console.log(`🗑️ Event ${eventId} successfully removed.`);
  }
}

export default db;
