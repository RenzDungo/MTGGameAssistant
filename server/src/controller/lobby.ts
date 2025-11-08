import  db  from "../db";
import { v4 as uuidv4 } from "uuid";
//Database Updates
const createLobbyStmt = db.prepare(`
    INSERT INTO lobbies (id, code, created_at)
    VALUES (@id, @code, @created_at)
    `
)

const getLobbyStmt = db.prepare(`
  SELECT * FROM lobbies WHERE code = ?
`);

//function for creating lobbies and getting lobbies
export function createLobby() {
    const id = uuidv4();
    const created_at = Date.now();
    const code = uuidv4().split("-")[0];

    createLobbyStmt.run({
        id,
        code,
        created_at
    });
    return {id, code, created_at}
}



export function getLobby(code: string) {
    return getLobbyStmt.get(code)
}